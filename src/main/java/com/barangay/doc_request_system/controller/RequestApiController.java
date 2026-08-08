package com.barangay.doc_request_system.controller;

import java.util.List;

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
@CrossOrigin(origins = "*") // Allows Vercel frontend to fetch data from Spring Boot
public class RequestApiController {

    @Autowired
    private TelegramService telegramService;

    @Autowired
    private DocumentRequestRepository requestRepository;

    @Autowired
    private UserRepository userRepository;

    // Test endpoint to verify your Telegram Bot
    @GetMapping("/test-telegram")
    public String testTelegram() {
        String myChatId = "8329704146"; 
        
        String message = "📢 Barangay Document Portal Notification Test!\n\n" +
                         "Hello! Your Telegram notification integration is working successfully!";

        telegramService.sendNotification(myChatId, message);
        
        return "Telegram test message sent! Check your phone.";
    }

    // 1. Fetch all requests for the frontend table
    @GetMapping
    public List<DocumentRequest> getAllRequests() {
        return requestRepository.findAll();
    }

    // 2. Accept a new document request from Vercel
    @PostMapping("/submit")
    public DocumentRequest submitRequest(@RequestBody DocumentRequest newRequest) {
        User student = userRepository.findByUsername("student").orElse(null);
        if (student != null && "BANNED".equalsIgnoreCase(student.getStatus())) {
            throw new RuntimeException("Account is banned. Cannot submit requests.");
        }
        
        newRequest.setUser(student);
        newRequest.setStatus("PENDING");

        DocumentRequest savedRequest = requestRepository.save(newRequest);

        if (student != null && student.getTelegramChatId() != null) {
            String message = "📄 **Barangay Document Portal Confirmation**\n\n" +
                             "Your request for **" + savedRequest.getDocumentType() + "** has been received!\n" +
                             "📌 **Status:** PENDING\n\n" +
                             "We will notify you here once your document status changes.";
                             
            telegramService.sendNotification(student.getTelegramChatId(), message);
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
            if (user != null && user.getTelegramChatId() != null) {
                String message = "🔔 **Barangay Document Status Update**\n\n" +
                                 "📄 **Document:** " + request.getDocumentType() + "\n" +
                                 "📌 **New Status:** " + request.getStatus() + "\n\n" +
                                 "Thank you for using the Barangay Document Portal!";
                                 
                telegramService.sendNotification(user.getTelegramChatId(), message);
            }
        }

        return request;
    }

    // Endpoint for Dify Chatbot Tool
    @GetMapping("/status")
    public List<DocumentRequest> getStatusForChatbot(@RequestParam(defaultValue = "student") String username) {
        return requestRepository.getStatusByUsername(username);
    }
}