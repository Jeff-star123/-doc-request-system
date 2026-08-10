package com.barangay.doc_request_system.service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TelegramService {

    @Value("${telegram.bot.token}")
    private String botToken;

    private final RestTemplate restTemplate = new RestTemplate();
    private final SecureRandom random = new SecureRandom();

    private final Map<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    private static class OtpData {
        String code;
        long expiryTime;

        OtpData(String code, long expiryTime) {
            this.code = code;
            this.expiryTime = expiryTime;
        }
    }

    public boolean sendNotification(String chatId, String message) {
        if (chatId == null || chatId.trim().isEmpty()) {
            System.out.println("No Telegram Chat ID provided.");
            return false;
        }

        String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

        Map<String, String> request = new HashMap<>();
        request.put("chat_id", chatId.trim());
        request.put("text", message);

        try {
            restTemplate.postForObject(url, request, String.class);
            System.out.println("Telegram notification successfully sent to " + chatId);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send Telegram message to " + chatId + ": " + e.getMessage());
            return false;
        }
    }

    public boolean sendOtp(String chatId) {
        if (chatId == null || chatId.trim().isEmpty()) {
            return false;
        }

        String otpCode = String.format("%06d", random.nextInt(1000000));
        long expiryTime = System.currentTimeMillis() + (5 * 60 * 1000); // 5 Minutes TTL

        String message = "🔐 Barangay Portal Verification Code: " + otpCode + 
                         "\n\nThis code will expire in 5 minutes. Do not share it with anyone.";

        boolean sent = sendNotification(chatId.trim(), message);
        if (sent) {
            otpStorage.put(chatId.trim(), new OtpData(otpCode, expiryTime));
            System.out.println("DEBUG OTP for " + chatId + ": " + otpCode); // Prints code to your console for testing
        }
        return sent;
    }

    public boolean verifyOtp(String chatId, String inputOtp) {
        if (chatId == null || inputOtp == null || inputOtp.trim().isEmpty()) {
            return false;
        }

        OtpData data = otpStorage.get(chatId.trim());
        if (data == null) {
            System.out.println("Verification failed: No active OTP found for " + chatId);
            return false;
        }

        if (System.currentTimeMillis() > data.expiryTime) {
            System.out.println("Verification failed: OTP expired for " + chatId);
            otpStorage.remove(chatId.trim());
            return false;
        }

        if (data.code.equals(inputOtp.trim())) {
            otpStorage.remove(chatId.trim()); // Clear code after successful use
            return true;
        }

        System.out.println("Verification failed: Incorrect OTP entered.");
        return false;
    }
}