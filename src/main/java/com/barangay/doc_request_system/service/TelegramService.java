package com.barangay.doc_request_system.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class TelegramService {

    @Value("${telegram.bot.token}")
    private String botToken;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendNotification(String chatId, String message) {
        if (chatId == null || chatId.isEmpty()) {
            System.out.println("No Telegram Chat ID provided.");
            return;
        }

        String url = "https://api.telegram.org/bot" + botToken + "/sendMessage";

        Map<String, String> request = new HashMap<>();
        request.put("chat_id", chatId);
        request.put("text", message);

        try {
            restTemplate.postForObject(url, request, String.class);
            System.out.println("Telegram notification successfully sent to " + chatId);
        } catch (Exception e) {
            System.err.println("Failed to send Telegram message: " + e.getMessage());
        }
    }
}