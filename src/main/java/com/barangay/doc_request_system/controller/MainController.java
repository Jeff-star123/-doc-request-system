package com.barangay.doc_request_system.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.barangay.doc_request_system.model.ArchivedUser;
import com.barangay.doc_request_system.model.DocumentRequest;
import com.barangay.doc_request_system.model.User;
import com.barangay.doc_request_system.repository.ArchivedUserRepository;
import com.barangay.doc_request_system.repository.DocumentRequestRepository;
import com.barangay.doc_request_system.repository.UserRepository;
import com.barangay.doc_request_system.service.TelegramService;

import jakarta.servlet.http.HttpSession;

@Controller
public class MainController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArchivedUserRepository archivedUserRepository;

    @Autowired
    private DocumentRequestRepository requestRepository;

    @Autowired
    private TelegramService telegramService;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    private User getAuthenticatedUser(HttpSession session) {
        return (User) session.getAttribute("loggedInUser");
    }

    // Helper method to check if the user is banned or deactivated and redirect to spam-banned if so
    private String checkUserAndRedirect(HttpSession session) {
        User user = getAuthenticatedUser(session);
        if (user == null) {
            return "redirect:/";
        }
        User freshUser = userRepository.findById(user.getId()).orElse(null);
        if (freshUser == null || "BANNED".equalsIgnoreCase(freshUser.getStatus()) || "DEACTIVATED".equalsIgnoreCase(freshUser.getStatus())) {
            return "redirect:/spam-banned";
        }
        return null;
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
        
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {

            if ("BANNED".equalsIgnoreCase(user.getStatus())) {
                model.addAttribute("error", "Your account has been permanently banned by the Barangay Administrator.");
                return "index";
            }

            if ("DEACTIVATED".equalsIgnoreCase(user.getStatus())) {
                model.addAttribute("showReactivatePrompt", true);
                model.addAttribute("pendingUserId", user.getId());
                model.addAttribute("pendingUsername", user.getUsername());
                return "index";
            }

            if ("REACTIVATION_PENDING".equalsIgnoreCase(user.getStatus())) {
                model.addAttribute("error", "Your account reactivation request is currently pending Admin approval.");
                return "index";
            }

            session.setAttribute("loggedInUser", user);
            session.removeAttribute("printTimestamps"); // Reset spam tracking timestamps on login

            if ("ADMIN".equals(user.getRole())) {
                return "redirect:/admin";
            }
            return "redirect:/dashboard";
        }
        
        model.addAttribute("error", "Invalid username or password!");
        return "index";
    }

    @PostMapping("/request/reactivate")
    public String requestReactivate(@RequestParam Long userId, RedirectAttributes redirectAttributes) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null && "DEACTIVATED".equalsIgnoreCase(user.getStatus())) {
            user.setStatus("REACTIVATION_PENDING");
            userRepository.save(user);

            if (user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
                telegramService.sendNotification(user.getTelegramChatId(),
                    "⏳ Account Reactivation Requested!\n\nYour request has been submitted to the Barangay Admin for review.");
            }

            redirectAttributes.addFlashAttribute("success", "Reactivation request submitted! Please await Admin decision.");
        }
        return "redirect:/";
    }

    @GetMapping("/dashboard")
    public String viewDashboard(HttpSession session, Model model) {
        // 1. Check if the user is banned or deactivated
        String redirectUrl = checkUserAndRedirect(session);
        if (redirectUrl != null) {
            return redirectUrl; // Redirects them to /spam-banned or / if not logged in
        }
        
        // 2. Proceed with loading the dashboard for valid users
        User user = getAuthenticatedUser(session);
        model.addAttribute("user", user);
        
        // Fetch user requests to populate the history table
        List<DocumentRequest> requests = requestRepository.findByUser(user);
        model.addAttribute("requests", requests);
        
        return "dashboard"; // Renders your dashboard.html
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
        
        String statusRedirect = checkUserAndRedirect(session);
        if (statusRedirect != null) return statusRedirect;

        User user = getAuthenticatedUser(session);

        String formattedPurpose = purpose;
        DocumentRequest docRequest = new DocumentRequest(user, documentType, formattedPurpose);
        docRequest.setFaceVerified(faceVerified);

        Path uploadPath = Paths.get("uploads");
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            if (idCardFile != null && !idCardFile.isEmpty()) {
                String originalFilename = Paths.get(idCardFile.getOriginalFilename()).getFileName().toString();
                String fileName = System.currentTimeMillis() + "_id_" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(idCardFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                docRequest.setIdCardImagePath("/uploads/" + fileName);
            }

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
        model.addAttribute("allUsers", userRepository.findAll());
        model.addAttribute("pendingReactivations", userRepository.findByStatus("REACTIVATION_PENDING"));
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

    @PostMapping("/admin/request/delete/{id}")
    public String deleteRequestPermanently(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            requestRepository.deleteById(id);
            redirectAttributes.addFlashAttribute("success", "Request permanently deleted.");
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to delete request.");
        }
        return "redirect:/admin";
    }

    @PostMapping("/admin/user/deactivate/{id}")
    public String adminDeactivateUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null && !"ADMIN".equals(user.getRole())) {
            ArchivedUser archivedUser = new ArchivedUser(user);
            archivedUserRepository.save(archivedUser);

            user.setStatus("DEACTIVATED");
            userRepository.save(user);

            if (user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
                telegramService.sendNotification(user.getTelegramChatId(),
                    "⚠️ Your account has been deactivated by the Barangay Administrator.");
            }
            redirectAttributes.addFlashAttribute("success", "User account deactivated successfully.");
        }
        return "redirect:/admin";
    }

    @PostMapping("/admin/user/ban/{id}")
    public String adminBanUser(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null && !"ADMIN".equals(user.getRole())) {
            ArchivedUser archivedUser = new ArchivedUser(user);
            archivedUserRepository.save(archivedUser);

            user.setStatus("BANNED");
            userRepository.save(user);

            if (user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
                telegramService.sendNotification(user.getTelegramChatId(),
                    "🚫 Your account has been permanently banned by the Barangay Administrator.");
            }
            redirectAttributes.addFlashAttribute("success", "User account banned successfully.");
        }
        return "redirect:/admin";
    }

    @RequestMapping(value = "/admin/user/approve-reactivation/{id}", method = {RequestMethod.GET, RequestMethod.POST})
    public String approveReactivation(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user != null) {
                try {
                    Optional<ArchivedUser> archiveOpt = archivedUserRepository.findByOriginalUserId(user.getId());
                    archiveOpt.ifPresent(archivedUser -> {
                        try {
                            archivedUserRepository.delete(archivedUser);
                        } catch (Exception ex) {
                            ex.printStackTrace();
                        }
                    });
                } catch (Exception e) {
                    e.printStackTrace();
                }

                user.setStatus("ACTIVE");
                userRepository.save(user);

                if (user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
                    try {
                        telegramService.sendNotification(user.getTelegramChatId(),
                            "🎉 Account Reactivated!\n\nYour account has been reactivated by the Barangay Admin. You can now log in.");
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                redirectAttributes.addFlashAttribute("success", "User account reactivated successfully.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to reactivate user account.");
        }
        return "redirect:/admin";
    }

    @RequestMapping(value = "/admin/user/reject-reactivation/{id}", method = {RequestMethod.GET, RequestMethod.POST})
    public String rejectReactivation(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user != null) {
                user.setStatus("DEACTIVATED");
                userRepository.save(user);

                if (user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
                    try {
                        telegramService.sendNotification(user.getTelegramChatId(),
                            "❌ Account Reactivation Request Rejected.\n\nPlease visit the Barangay Office for assistance.");
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                }

                redirectAttributes.addFlashAttribute("success", "Reactivation request rejected.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("error", "Failed to reject reactivation request.");
        }
        return "redirect:/admin";
    }

    @SuppressWarnings("unchecked")
    @GetMapping("/request/print/{id}")
    public String printDocument(@PathVariable Long id, HttpSession session, Model model) {
        String statusRedirect = checkUserAndRedirect(session);
        if (statusRedirect != null) return statusRedirect;

        User user = getAuthenticatedUser(session);

        long currentTime = System.currentTimeMillis();
        
        // Track print timestamps in a sliding window of 10 seconds (10000 ms)
        List<Long> printTimestamps = (List<Long>) session.getAttribute("printTimestamps");
        if (printTimestamps == null) {
            printTimestamps = new ArrayList<>();
        }

        printTimestamps.add(currentTime);
        // Remove timestamps older than 10 seconds
        printTimestamps.removeIf(timestamp -> (currentTime - timestamp) > 10000);
        session.setAttribute("printTimestamps", printTimestamps);

        // Trigger deactivation if 5 print attempts occur within 10 seconds
        if (printTimestamps.size() >= 5) {
            if (user != null && !"ADMIN".equals(user.getRole())) {
                ArchivedUser archivedUser = new ArchivedUser(user);
                archivedUserRepository.save(archivedUser);

                user.setStatus("DEACTIVATED");
                userRepository.save(user);

                if (user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
                    telegramService.sendNotification(user.getTelegramChatId(),
                        "⚠️ Your account has been deactivated due to spamming print requests.");
                }
            }
            return "redirect:/spam-banned";
        }

        DocumentRequest docRequest = requestRepository.findById(id).orElse(null);
        if (docRequest == null || !"APPROVED".equals(docRequest.getStatus())) {
            return "redirect:/dashboard";
        }

        model.addAttribute("request", docRequest);
        return "print_template";
    }

    @GetMapping("/spam-banned")
    public String handleSpamBan(HttpSession session) {
        User currentUser = getAuthenticatedUser(session);
        
        if (currentUser != null) {
            // Fetch the fresh user from the database to ensure we update the latest record
            User freshUser = userRepository.findById(currentUser.getId()).orElse(null);
            
            if (freshUser != null && !"DEACTIVATED".equalsIgnoreCase(freshUser.getStatus())) {
                // 1. Lock the account
                freshUser.setStatus("DEACTIVATED");
                userRepository.save(freshUser);
                
                // 2. Notify via Telegram (since you have telegramService injected)
                if (freshUser.getTelegramChatId() != null && !freshUser.getTelegramChatId().trim().isEmpty()) {
                    telegramService.sendNotification(freshUser.getTelegramChatId(),
                        "🚨 ALERT: Your account has been DEACTIVATED due to continuous spamming of the print request system. Admin approval is required to restore access."
                    );
                }
            }
            // 3. Clear the session so they are effectively logged out and cannot bypass the block
            session.invalidate();
        }
        
        // Render the spam-banned.html template with the jump scare
        return "spam-banned";
    }

    @GetMapping("/register")
    public String registerPage() {
        return "register";
    }

    @PostMapping("/register")
    public String registerUser(@RequestParam String fullName,
                               @RequestParam String username,
                               @RequestParam String password,
                               @RequestParam(required = false) String district,
                               @RequestParam(required = false) String barangay,
                               @RequestParam(required = false) String telegramChatId,
                               Model model) {

        if (userRepository.findByUsername(username).isPresent()) {
            model.addAttribute("error", "Username already taken! Please choose another.");
            return "register";
        }

        String hashedPassword = passwordEncoder.encode(password);
        User newUser = new User(fullName, username, hashedPassword, "STUDENT");
        
        if (district != null && !district.trim().isEmpty()) {
            newUser.setDistrict(district.trim());
        }

        if (barangay != null && !barangay.trim().isEmpty()) {
            newUser.setBarangay(barangay.trim());
        }

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
        String statusRedirect = checkUserAndRedirect(session);
        if (statusRedirect != null) return statusRedirect;

        User user = getAuthenticatedUser(session);
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
        String statusRedirect = checkUserAndRedirect(session);
        if (statusRedirect != null) return statusRedirect;

        User user = getAuthenticatedUser(session);

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
        String statusRedirect = checkUserAndRedirect(session);
        if (statusRedirect != null) return statusRedirect;

        User user = getAuthenticatedUser(session);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            redirectAttributes.addFlashAttribute("errorMessage", "Incorrect current password entered!");
            return "redirect:/settings";
        }

        if (!newPassword.equals(confirmPassword)) {
            redirectAttributes.addFlashAttribute("errorMessage", "New passwords do not match!");
            return "redirect:/settings";
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        session.setAttribute("loggedInUser", user);

        redirectAttributes.addFlashAttribute("successMessage", "Password changed successfully!");
        return "redirect:/settings";
    }

    @PostMapping("/settings/deactivate-account")
    public String deactivateAccount(@RequestParam String confirmPassword,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        String statusRedirect = checkUserAndRedirect(session);
        if (statusRedirect != null) return statusRedirect;

        User user = getAuthenticatedUser(session);

        if (!passwordEncoder.matches(confirmPassword, user.getPassword())) {
            redirectAttributes.addFlashAttribute("errorMessage", "Incorrect password confirmation. Account deactivation cancelled.");
            return "redirect:/settings";
        }

        try {
            ArchivedUser archivedUser = new ArchivedUser(user);
            archivedUserRepository.save(archivedUser);

            user.setStatus("DEACTIVATED");
            userRepository.save(user);

            session.invalidate();

            redirectAttributes.addFlashAttribute("success", "Your account has been deactivated.");
            return "redirect:/";
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to deactivate account due to a server error.");
            return "redirect:/settings";
        }
    }
}