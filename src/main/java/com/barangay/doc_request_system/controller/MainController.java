package com.barangay.doc_request_system.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.barangay.doc_request_system.model.DocumentRequest;
import com.barangay.doc_request_system.model.User;
import com.barangay.doc_request_system.repository.DocumentRequestRepository;
import com.barangay.doc_request_system.repository.UserRepository;
import com.barangay.doc_request_system.service.TelegramService;

import jakarta.servlet.http.HttpSession;

@Controller
public class MainController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRequestRepository requestRepository;

    @Autowired
    private TelegramService telegramService; // 1. INJECT TELEGRAM SERVICE

    // 1. Home / Login Page
    @GetMapping("/")
    public String index() {
        return "index";
    }

    // 2. Simple Login Handler
    @PostMapping("/login")
    public String login(@RequestParam String username, 
                        @RequestParam String password, 
                        HttpSession session, 
                        Model model) {
        
        User user = userRepository.findByUsername(username).orElse(null);
        
        if (user != null && user.getPassword().equals(password)) {
            session.setAttribute("loggedInUser", user);
            if ("ADMIN".equals(user.getRole())) {
                return "redirect:/admin";
            }
            return "redirect:/dashboard";
        }
        
        model.addAttribute("error", "Invalid username or password!");
        return "index";
    }

    // 3. Student Dashboard View
    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) return "redirect:/";

        model.addAttribute("user", user);
        model.addAttribute("requests", requestRepository.findByUser(user));
        return "dashboard";
    }

    // 4. Submit Request Handler (NOTIFIES USER ON TELEGRAM)
    @PostMapping("/request/submit")
    public String submitRequest(@RequestParam String documentType, 
                                @RequestParam String purpose, 
                                HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) return "redirect:/";

        DocumentRequest docRequest = new DocumentRequest(user, documentType, purpose);
        DocumentRequest savedRequest = requestRepository.save(docRequest);

        // Send Telegram notification on submission
        if (user.getTelegramChatId() != null && !user.getTelegramChatId().isEmpty()) {
            String message = "📄 Barangay Document Request Submitted!\n\n" +
                             "Document: " + savedRequest.getDocumentType() + "\n" +
                             "Purpose: " + savedRequest.getPurpose() + "\n" +
                             "Status: PENDING\n\n" +
                             "We will notify you once your document status changes!";
            telegramService.sendNotification(user.getTelegramChatId(), message);
        }

        return "redirect:/dashboard";
    }

    // 5. Logout
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    // 6. Admin Dashboard View
    @GetMapping("/admin")
    public String adminDashboard(HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return "redirect:/";
        }

        model.addAttribute("adminUser", user);
        model.addAttribute("requests", requestRepository.findAll());
        return "admin";
    }

    // 7. Approve Request Action (NOTIFIES USER ON TELEGRAM)
    @PostMapping("/admin/approve/{id}")
    public String approveRequest(@PathVariable Long id, @RequestParam(required = false) String remarks) {
        DocumentRequest docRequest = requestRepository.findById(id).orElse(null);
        if (docRequest != null) {
            docRequest.setStatus("APPROVED");
            docRequest.setRemarks(remarks != null ? remarks : "Approved by Admin");
            requestRepository.save(docRequest);

            // Send Telegram Notification
            User user = docRequest.getUser();
            if (user != null && user.getTelegramChatId() != null && !user.getTelegramChatId().isEmpty()) {
                String message = "✅ Document Request APPROVED!\n\n" +
                                 "Document: " + docRequest.getDocumentType() + "\n" +
                                 "Remarks: " + docRequest.getRemarks() + "\n\n" +
                                 "Your document is ready for processing/pickup!";
                telegramService.sendNotification(user.getTelegramChatId(), message);
            }
        }
        return "redirect:/admin";
    }

    // 8. Reject Request Action (NOTIFIES USER ON TELEGRAM)
    @PostMapping("/admin/reject/{id}")
    public String rejectRequest(@PathVariable Long id, @RequestParam(required = false) String remarks) {
        DocumentRequest docRequest = requestRepository.findById(id).orElse(null);
        if (docRequest != null) {
            docRequest.setStatus("REJECTED");
            docRequest.setRemarks(remarks != null ? remarks : "Rejected by Admin");
            requestRepository.save(docRequest);

            // Send Telegram Notification
            User user = docRequest.getUser();
            if (user != null && user.getTelegramChatId() != null && !user.getTelegramChatId().isEmpty()) {
                String message = "❌ Document Request REJECTED\n\n" +
                                 "Document: " + docRequest.getDocumentType() + "\n" +
                                 "Reason/Remarks: " + docRequest.getRemarks();
                telegramService.sendNotification(user.getTelegramChatId(), message);
            }
        }
        return "redirect:/admin";
    }

    // 9. Printable Document Page
    @GetMapping("/request/print/{id}")
    public String printDocument(@PathVariable Long id, HttpSession session, Model model) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) return "redirect:/";

        DocumentRequest docRequest = requestRepository.findById(id).orElse(null);
        if (docRequest == null || !"APPROVED".equals(docRequest.getStatus())) {
            return "redirect:/dashboard";
        }

        model.addAttribute("request", docRequest);
        return "print_template";
    }

    // Show Registration Page
    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    // Process Registration Form
    @PostMapping("/register")
    public String registerUser(@RequestParam String fullName,
                               @RequestParam String username,
                               @RequestParam String password,
                               @RequestParam(required = false) String telegramChatId,
                               Model model) {

        // Check if username already exists
        if (userRepository.findByUsername(username).isPresent()) {
            model.addAttribute("error", "Username already taken! Please choose another.");
            return "register";
        }

        // Create new user (Default role: STUDENT)
        User newUser = new User(fullName, username, password, "STUDENT");
        if (telegramChatId != null && !telegramChatId.trim().isEmpty()) {
            newUser.setTelegramChatId(telegramChatId.trim());
        }

        userRepository.save(newUser);

        // Send a test Telegram welcome message if Chat ID was provided
        if (newUser.getTelegramChatId() != null && !newUser.getTelegramChatId().isEmpty()) {
            String message = "🎉 Welcome to Barangay Portal, " + fullName + "!\n\n" +
                             "Your account has been successfully created. You will receive updates about your document requests here.";
            telegramService.sendNotification(newUser.getTelegramChatId(), message);
        }

        model.addAttribute("success", "Account created successfully! Please log in.");
        return "index";
    }
}