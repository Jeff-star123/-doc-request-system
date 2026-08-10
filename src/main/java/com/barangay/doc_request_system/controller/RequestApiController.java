package com.barangay.doc_request_system.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.barangay.doc_request_system.model.DocumentRequest;
import com.barangay.doc_request_system.model.User;
import com.barangay.doc_request_system.repository.DocumentRequestRepository;
import com.barangay.doc_request_system.repository.UserRepository;
import com.barangay.doc_request_system.service.TelegramService;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*") // Allows your frontend (e.g., Vercel) to fetch data smoothly
public class RequestApiController {

    @Autowired
    private TelegramService telegramService;

    @Autowired
    private DocumentRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    // Test endpoint to verify your Telegram Bot connection
    @GetMapping("/test-telegram")
    public String testTelegram() {
        String myChatId = "8329704146"; 
        String message = "📢 Barangay Document Portal Notification Test!\n\n" +
                         "Hello! Your Telegram notification integration is working successfully!";

        telegramService.sendNotification(myChatId, message);
        return "Telegram test message sent! Check your phone.";
    }

    // 1. Send Telegram OTP Endpoint (Supports Query Parameters or JSON Body)
    @PostMapping("/telegram/send-otp")
    public Map<String, Object> sendTelegramOtp(
            @RequestParam(required = false) String chatId,
            @RequestBody(required = false) Map<String, String> body) {
        
        String targetChatId = chatId;
        if ((targetChatId == null || targetChatId.trim().isEmpty()) && body != null) {
            targetChatId = body.get("chatId");
        }

        Map<String, Object> response = new HashMap<>();
        boolean success = telegramService.sendOtp(targetChatId);
        response.put("success", success);
        response.put("message", success ? "OTP sent to Telegram!" : "Failed to send OTP. Ensure you have started the bot on Telegram first.");
        return response;
    }

    // 2. Verify Telegram OTP Endpoint (Supports Query Parameters or JSON Body)
    @PostMapping("/telegram/verify-otp")
    public Map<String, Object> verifyTelegramOtp(
            @RequestParam(required = false) String chatId,
            @RequestParam(required = false) String otp,
            @RequestBody(required = false) Map<String, String> body) {
        
        String targetChatId = chatId;
        String targetOtp = otp;

        if (body != null) {
            if (targetChatId == null || targetChatId.trim().isEmpty()) {
                targetChatId = body.get("chatId");
            }
            if (targetOtp == null || targetOtp.trim().isEmpty()) {
                targetOtp = body.get("otp");
            }
        }

        Map<String, Object> response = new HashMap<>();
        boolean verified = telegramService.verifyOtp(targetChatId, targetOtp);
        response.put("success", verified);
        response.put("message", verified ? "OTP verified successfully!" : "Invalid or expired OTP.");
        return response;
    }

    // 3. Fetch all requests for the frontend table
    @GetMapping
    public List<DocumentRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    // 4. Accept a new document request from frontend/Vercel
    @PostMapping("/submit")
    public DocumentRequest submitRequest(@RequestBody DocumentRequest newRequest) {
        User user = null;

        // Dynamically resolve user from the payload (fixes the hardcoded "student" bug)
        if (newRequest.getUser() != null) {
            if (newRequest.getUser().getId() != null) {
                user = userRepository.findById(newRequest.getUser().getId()).orElse(null);
            } else if (newRequest.getUser().getUsername() != null) {
                user = userRepository.findByUsername(newRequest.getUser().getUsername()).orElse(null);
            }
        }

        // Fallback to "student" if no identifier is provided
        if (user == null) {
            user = userRepository.findByUsername("student").orElse(null);
        }

        if (user != null && "BANNED".equalsIgnoreCase(user.getStatus())) {
            throw new RuntimeException("Account is banned. Cannot submit requests.");
        }
        
        newRequest.setUser(user);
        newRequest.setStatus("PENDING");

        DocumentRequest savedRequest = requestRepository.save(newRequest);

        // Safe Telegram notification dispatch
        if (user != null && user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
            String message = "📄 **Barangay Document Portal Confirmation**\n\n" +
                             "Your request for **" + savedRequest.getDocumentType() + "** has been received!\n" +
                             "📌 **Status:** PENDING\n\n" +
                             "We will notify you here once your document status changes.";
                             
            telegramService.sendNotification(user.getTelegramChatId(), message);
        }

        return savedRequest;
    }

    // Admin updates status -> Auto-notifies resident on Telegram
    @PostMapping("/update-status")
    public DocumentRequest updateStatus(@RequestParam Long requestId, @RequestParam String newStatus) {
        DocumentRequest request = requestRepository.findById(requestId).orElse(null);

        if (request != null) {
            request.setStatus(newStatus.toUpperCase());
            requestRepository.save(request);

            User user = request.getUser();
            if (user != null && user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
                String message = "🔔 **Barangay Document Status Update**\n\n" +
                                 "📄 **Document:** " + request.getDocumentType() + "\n" +
                                 "📌 **New Status:** " + request.getStatus() + "\n\n" +
                                 "Thank you for using the Barangay Document Portal!";
                                 
                telegramService.sendNotification(user.getTelegramChatId(), message);
            }
        }

        return request;
    }

    // Endpoint for Chatbot Tool integration
    @GetMapping("/status")
    public List<DocumentRequest> getStatusForChatbot(@RequestParam(defaultValue = "student") String username) {
        return requestRepository.getStatusByUsername(username);
    }
}