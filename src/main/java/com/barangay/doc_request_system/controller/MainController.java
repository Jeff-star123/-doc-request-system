package com.barangay.doc_request_system.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

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
    private TelegramService telegramService;

    private User getAuthenticatedUser(HttpSession session) {
        return (User) session.getAttribute("loggedInUser");
    }

    @GetMapping("/")
    public String index() {
        return "index";
    }

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

    @GetMapping("/dashboard")
    public String dashboard(HttpSession session, Model model) {
        User user = getAuthenticatedUser(session);
        if (user == null) return "redirect:/";

        model.addAttribute("user", user);
        model.addAttribute("requests", requestRepository.findByUser(user));
        return "dashboard";
    }

    @PostMapping("/request/submit")
    public String submitRequest(@RequestParam("documentType") String documentType, 
                                @RequestParam("purpose") String purpose, 
                                @RequestParam(value = "idType", defaultValue = "Unspecified ID") String idType,
                                @RequestParam("idCardFile") MultipartFile idCardFile,
                                @RequestParam(value = "selfieWithIdFile", required = false) MultipartFile selfieWithIdFile,
                                @RequestParam(value = "faceVerified", defaultValue = "false") boolean faceVerified,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        
        User user = getAuthenticatedUser(session);
        if (user == null) return "redirect:/";

        String formattedPurpose = "[" + idType + "] " + purpose;
        DocumentRequest docRequest = new DocumentRequest(user, documentType, formattedPurpose);
        docRequest.setFaceVerified(faceVerified);

        Path uploadPath = Paths.get("uploads");
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save ID Card File
            if (idCardFile != null && !idCardFile.isEmpty()) {
                String originalFilename = Paths.get(idCardFile.getOriginalFilename()).getFileName().toString();
                String fileName = System.currentTimeMillis() + "_id_" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(idCardFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                docRequest.setIdCardImagePath("/uploads/" + fileName);
            }

            // Save Selfie with ID File
            if (selfieWithIdFile != null && !selfieWithIdFile.isEmpty()) {
                String originalFilename = Paths.get(selfieWithIdFile.getOriginalFilename()).getFileName().toString();
                String fileName = System.currentTimeMillis() + "_selfie_" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(selfieWithIdFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                docRequest.setSelfieImagePath("/uploads/" + fileName);
            }

        } catch (IOException e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Error uploading files. Please try again.");
            return "redirect:/dashboard";
        }

        DocumentRequest savedRequest = requestRepository.save(docRequest);

        if (user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
            String message = "📄 Barangay Document Request Submitted!\n\n" +
                             "Document: " + savedRequest.getDocumentType() + "\n" +
                             "ID Type: " + idType + "\n" +
                             "Purpose: " + purpose + "\n" +
                             "Face Verification: " + (savedRequest.isFaceVerified() ? "PASSED ✅" : "NOT PASSED ❌") + "\n" +
                             "Status: PENDING\n\n" +
                             "We will notify you once your document status changes!";
            telegramService.sendNotification(user.getTelegramChatId(), message);
        }

        return "redirect:/dashboard";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/";
    }

    @GetMapping("/admin")
    public String adminDashboard(HttpSession session, Model model) {
        User user = getAuthenticatedUser(session);
        if (user == null || !"ADMIN".equals(user.getRole())) {
            return "redirect:/";
        }

        model.addAttribute("adminUser", user);
        model.addAttribute("requests", requestRepository.findAll());
        return "admin";
    }

    @PostMapping("/admin/approve/{id}")
    public String approveRequest(@PathVariable Long id, @RequestParam(required = false) String remarks) {
        DocumentRequest docRequest = requestRepository.findById(id).orElse(null);
        if (docRequest != null) {
            docRequest.setStatus("APPROVED");
            docRequest.setRemarks(remarks != null && !remarks.isBlank() ? remarks : "Approved by Admin");
            requestRepository.save(docRequest);

            User user = docRequest.getUser();
            if (user != null && user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
                String message = "✅ Document Request APPROVED!\n\n" +
                                 "Document: " + docRequest.getDocumentType() + "\n" +
                                 "Remarks: " + docRequest.getRemarks() + "\n\n" +
                                 "Your document is ready for processing/pickup!";
                telegramService.sendNotification(user.getTelegramChatId(), message);
            }
        }
        return "redirect:/admin";
    }

    @PostMapping("/admin/reject/{id}")
    public String rejectRequest(@PathVariable Long id, @RequestParam(required = false) String remarks) {
        DocumentRequest docRequest = requestRepository.findById(id).orElse(null);
        if (docRequest != null) {
            docRequest.setStatus("REJECTED");
            docRequest.setRemarks(remarks != null && !remarks.isBlank() ? remarks : "Rejected by Admin");
            requestRepository.save(docRequest);

            User user = docRequest.getUser();
            if (user != null && user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
                String message = "❌ Document Request REJECTED\n\n" +
                                 "Document: " + docRequest.getDocumentType() + "\n" +
                                 "Reason/Remarks: " + docRequest.getRemarks();
                telegramService.sendNotification(user.getTelegramChatId(), message);
            }
        }
        return "redirect:/admin";
    }

    @GetMapping("/request/print/{id}")
    public String printDocument(@PathVariable Long id, HttpSession session, Model model) {
        User user = getAuthenticatedUser(session);
        if (user == null) return "redirect:/";

        DocumentRequest docRequest = requestRepository.findById(id).orElse(null);
        if (docRequest == null || !"APPROVED".equals(docRequest.getStatus())) {
            return "redirect:/dashboard";
        }

        model.addAttribute("request", docRequest);
        return "print_template";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(@RequestParam String fullName,
                               @RequestParam String username,
                               @RequestParam String password,
                               @RequestParam(required = false) String telegramChatId,
                               Model model) {

        if (userRepository.findByUsername(username).isPresent()) {
            model.addAttribute("error", "Username already taken! Please choose another.");
            return "register";
        }

        User newUser = new User(fullName, username, password, "STUDENT");
        if (telegramChatId != null && !telegramChatId.trim().isEmpty()) {
            newUser.setTelegramChatId(telegramChatId.trim());
        }

        userRepository.save(newUser);

        if (newUser.getTelegramChatId() != null && !newUser.getTelegramChatId().isEmpty()) {
            String message = "🎉 Welcome to Barangay Portal, " + fullName + "!\n\n" +
                             "Your account has been successfully created. You will receive updates about your document requests here.";
            telegramService.sendNotification(newUser.getTelegramChatId(), message);
        }

        model.addAttribute("success", "Account created successfully! Please log in.");
        return "index";
    }

    @GetMapping("/settings")
    public String viewSettings(HttpSession session, Model model) {
        User user = getAuthenticatedUser(session);
        if (user == null) return "redirect:/";

        User freshUser = userRepository.findById(user.getId()).orElse(user);
        model.addAttribute("user", freshUser);
        
        return "settings";
    }

    @PostMapping("/settings/update-profile")
    public String updateProfile(@RequestParam String fullName,
                                @RequestParam String username,
                                @RequestParam(required = false) String telegramChatId,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        User user = getAuthenticatedUser(session);
        if (user == null) return "redirect:/";

        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
            redirectAttributes.addFlashAttribute("errorMessage", "Username is already taken by another user!");
            return "redirect:/settings";
        }

        user.setFullName(fullName);
        user.setUsername(username);
        user.setTelegramChatId(telegramChatId != null ? telegramChatId.trim() : "");

        userRepository.save(user);
        session.setAttribute("loggedInUser", user);

        redirectAttributes.addFlashAttribute("successMessage", "Profile information updated successfully!");
        return "redirect:/settings";
    }

    @PostMapping("/settings/change-password")
    public String changePassword(@RequestParam String currentPassword,
                                 @RequestParam String newPassword,
                                 @RequestParam String confirmPassword,
                                 HttpSession session,
                                 RedirectAttributes redirectAttributes) {
        User user = getAuthenticatedUser(session);
        if (user == null) return "redirect:/";

        if (!user.getPassword().equals(currentPassword)) {
            redirectAttributes.addFlashAttribute("errorMessage", "Incorrect current password entered!");
            return "redirect:/settings";
        }

        if (!newPassword.equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("errorMessage", "New passwords do not match!");
            return "redirect:/settings";
        }

        user.setPassword(newPassword);
        userRepository.save(user);
        session.setAttribute("loggedInUser", user);

        redirectAttributes.addFlashAttribute("successMessage", "Password changed successfully!");
        return "redirect:/settings";
    }

    @PostMapping("/settings/delete-account")
    public String deleteAccount(@RequestParam String confirmPassword,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        User user = getAuthenticatedUser(session);
        if (user == null) return "redirect:/";

        if (!user.getPassword().equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("errorMessage", "Incorrect password confirmation. Account deletion cancelled.");
            return "redirect:/settings";
        }

        try {
            requestRepository.deleteByUser(user);
            userRepository.delete(user);
            session.invalidate();

            redirectAttributes.addFlashAttribute("success", "Your account has been permanently deleted.");
            return "redirect:/";
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to delete account due to a server error.");
            return "redirect:/settings";
        }
    }
}