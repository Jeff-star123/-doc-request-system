package com.barangay.doc_request_system.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
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

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();

    // Fallback to Spring SecurityContextHolder if session user is null
    private User getAuthenticatedUser(HttpSession session) {
        User user = (User) session.getAttribute("loggedInUser");
        if (user == null) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                String username = auth.getName();
                user = userRepository.findByUsername(username).orElse(null);
                if (user != null) {
                    session.setAttribute("loggedInUser", user);
                }
            }
        }
        return user;
    }

    // Helper method to check if the user is banned or deactivated
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
    public String index(@RequestParam(value = "error", required = false) String error, Model model) {
        if (error != null) {
            model.addAttribute("error", "Invalid username or password!");
        }
        return "index";
    }

    @PostMapping("/login")
    public String login(@RequestParam String username, 
                        @RequestParam String password, 
                        HttpServletRequest request,
                        HttpServletResponse response,
                        HttpSession session, 
                        Model model) {
        
        System.out.println("\n--------------------------------------------------");
        System.out.println("🔍 [LOGIN DEBUG] Attempting login for username: '" + username + "'");

        User user = userRepository.findByUsername(username).orElse(null);
        
        if (user == null) {
            System.err.println("❌ [LOGIN DEBUG] User NOT FOUND in database!");
            model.addAttribute("error", "Invalid username or password!");
            return "index";
        }

        System.out.println("✅ [LOGIN DEBUG] User found! Name: " + user.getFullName() + " | Role: " + user.getRole() + " | Status: " + user.getStatus());

        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
        System.out.println("🔑 [LOGIN DEBUG] BCrypt Password match: " + (passwordMatches ? "PASSED ✅" : "FAILED ❌"));

        if (!passwordMatches) {
            model.addAttribute("error", "Invalid username or password!");
            return "index";
        }

        if ("BANNED".equalsIgnoreCase(user.getStatus())) {
            System.err.println("🚫 [LOGIN DEBUG] Login rejected: Account is BANNED.");
            model.addAttribute("error", "Your account has been permanently banned by the Barangay Administrator.");
            return "index";
        }

        if ("DEACTIVATED".equalsIgnoreCase(user.getStatus())) {
            System.out.println("⚠️ [LOGIN DEBUG] Account DEACTIVATED. Triggering Reactivation Prompt.");
            model.addAttribute("showReactivatePrompt", true);
            model.addAttribute("pendingUserId", user.getId());
            model.addAttribute("pendingUsername", user.getUsername());
            return "index";
        }

        if ("REACTIVATION_PENDING".equalsIgnoreCase(user.getStatus())) {
            System.out.println("⏳ [LOGIN DEBUG] Account REACTIVATION_PENDING.");
            model.addAttribute("error", "Your account reactivation request is currently pending Admin approval.");
            return "index";
        }

        // 1. Store in HTTP Session for Thymeleaf views
        session.setAttribute("loggedInUser", user);
        session.removeAttribute("printTimestamps");

        // 2. Register Authentication in Spring Security Context
        String roleName = user.getRole().startsWith("ROLE_") ? user.getRole().toUpperCase() : "ROLE_" + user.getRole().toUpperCase();
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            user.getUsername(),
            null,
            Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);

        // 3. PERSIST SecurityContext across HTTP redirects (Spring Security 6)
        securityContextRepository.saveContext(context, request, response);
        System.out.println("🔐 [LOGIN DEBUG] Spring SecurityContext persisted to Session for role: " + roleName);

        if ("ADMIN".equalsIgnoreCase(user.getRole())) {
            System.out.println("🚀 [LOGIN DEBUG] Redirecting ADMIN to /admin");
            return "redirect:/admin";
        }
        
        System.out.println("🚀 [LOGIN DEBUG] Redirecting Resident to /dashboard");
        return "redirect:/dashboard";
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
        String redirectUrl = checkUserAndRedirect(session);
        if (redirectUrl != null) {
            return redirectUrl;
        }
        
        User user = getAuthenticatedUser(session);
        model.addAttribute("user", user);
        
        List<DocumentRequest> requests = requestRepository.findByUser(user);
        model.addAttribute("requests", requests);
        
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

            // Save image paths pointing to /secure-uploads/ (FileAccessController)
            if (idCardFile != null && !idCardFile.isEmpty()) {
                String originalFilename = Paths.get(idCardFile.getOriginalFilename()).getFileName().toString();
                String fileName = System.currentTimeMillis() + "_id_" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(idCardFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                docRequest.setIdCardImagePath("/secure-uploads/" + fileName);
            }

            if (selfieWithIdFile != null && !selfieWithIdFile.isEmpty()) {
                String originalFilename = Paths.get(selfieWithIdFile.getOriginalFilename()).getFileName().toString();
                String fileName = System.currentTimeMillis() + "_selfie_" + originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");
                Path filePath = uploadPath.resolve(fileName);
                Files.copy(selfieWithIdFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
                docRequest.setSelfieImagePath("/secure-uploads/" + fileName);
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
        SecurityContextHolder.clearContext();
        return "redirect:/";
    }

    @GetMapping("/admin")
    public String adminDashboard(HttpSession session, Model model) {
        User user = getAuthenticatedUser(session);
        if (user == null || (!"ADMIN".equalsIgnoreCase(user.getRole()) && !"ROLE_ADMIN".equalsIgnoreCase(user.getRole()))) {
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
        if (user != null && !"ADMIN".equalsIgnoreCase(user.getRole()) && !"ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
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
        if (user != null && !"ADMIN".equalsIgnoreCase(user.getRole()) && !"ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
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
        
        List<Long> printTimestamps = (List<Long>) session.getAttribute("printTimestamps");
        if (printTimestamps == null) {
            printTimestamps = new ArrayList<>();
        }

        printTimestamps.add(currentTime);
        printTimestamps.removeIf(timestamp -> (currentTime - timestamp) > 10000);
        session.setAttribute("printTimestamps", printTimestamps);

        if (printTimestamps.size() >= 5) {
            if (user != null && !"ADMIN".equalsIgnoreCase(user.getRole()) && !"ROLE_ADMIN".equalsIgnoreCase(user.getRole())) {
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
            User freshUser = userRepository.findById(currentUser.getId()).orElse(null);
            
            if (freshUser != null && !"DEACTIVATED".equalsIgnoreCase(freshUser.getStatus())) {
                freshUser.setStatus("DEACTIVATED");
                userRepository.save(freshUser);
                
                if (freshUser.getTelegramChatId() != null && !freshUser.getTelegramChatId().trim().isEmpty()) {
                    telegramService.sendNotification(freshUser.getTelegramChatId(),
                        "🚨 ALERT: Your account has been DEACTIVATED due to continuous spamming of the print request system. Admin approval is required to restore access."
                    );
                }
            }
            session.invalidate();
            SecurityContextHolder.clearContext();
        }
        
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
                                @RequestParam String currentPassword,
                                @RequestParam(required = false) String otpCode,
                                HttpSession session,
                                RedirectAttributes redirectAttributes) {
        String statusRedirect = checkUserAndRedirect(session);
        if (statusRedirect != null) return statusRedirect;

        User user = getAuthenticatedUser(session);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            redirectAttributes.addFlashAttribute("errorMessage", "Incorrect current password entered!");
            return "redirect:/settings";
        }

        String targetChatId = (telegramChatId != null && !telegramChatId.trim().isEmpty()) 
                ? telegramChatId.trim() 
                : user.getTelegramChatId();

        if (targetChatId != null && !targetChatId.trim().isEmpty()) {
            if (otpCode == null || !telegramService.verifyOtp(targetChatId, otpCode)) {
                redirectAttributes.addFlashAttribute("errorMessage", "Invalid or expired Telegram OTP code! Verification failed.");
                return "redirect:/settings";
            }
        }

        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
            redirectAttributes.addFlashAttribute("errorMessage", "Username is already taken by another user!");
            return "redirect:/settings";
        }

        user.setFullName(fullName);
        user.setUsername(username);
        user.setTelegramChatId(targetChatId != null ? targetChatId : "");

        userRepository.save(user);
        session.setAttribute("loggedInUser", user);

        redirectAttributes.addFlashAttribute("successMessage", "Profile information updated successfully!");
        return "redirect:/settings";
    }

    @PostMapping("/settings/change-password")
    public String changePassword(@RequestParam String currentPassword,
                                 @RequestParam String newPassword,
                                 @RequestParam String confirmPassword,
                                 @RequestParam(required = false) String otpCode,
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

        if (user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
            if (otpCode == null || !telegramService.verifyOtp(user.getTelegramChatId(), otpCode)) {
                redirectAttributes.addFlashAttribute("errorMessage", "Invalid or expired Telegram OTP code!");
                return "redirect:/settings";
            }
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        session.setAttribute("loggedInUser", user);

        redirectAttributes.addFlashAttribute("successMessage", "Password changed successfully!");
        return "redirect:/settings";
    }

    @PostMapping("/settings/deactivate-account")
    public String deactivateAccount(@RequestParam String confirmPassword,
                                    @RequestParam(required = false) String otpCode,
                                    HttpSession session,
                                    RedirectAttributes redirectAttributes) {
        String statusRedirect = checkUserAndRedirect(session);
        if (statusRedirect != null) return statusRedirect;

        User user = getAuthenticatedUser(session);

        if (!passwordEncoder.matches(confirmPassword, user.getPassword())) {
            redirectAttributes.addFlashAttribute("errorMessage", "Incorrect password confirmation. Account deactivation cancelled.");
            return "redirect:/settings";
        }

        if (user.getTelegramChatId() != null && !user.getTelegramChatId().trim().isEmpty()) {
            if (otpCode == null || !telegramService.verifyOtp(user.getTelegramChatId(), otpCode)) {
                redirectAttributes.addFlashAttribute("errorMessage", "Invalid or expired Telegram OTP code!");
                return "redirect:/settings";
            }
        }

        try {
            ArchivedUser archivedUser = new ArchivedUser(user);
            archivedUserRepository.save(archivedUser);

            user.setStatus("DEACTIVATED");
            userRepository.save(user);

            session.invalidate();
            SecurityContextHolder.clearContext();

            redirectAttributes.addFlashAttribute("success", "Your account has been deactivated.");
            return "redirect:/";
        } catch (Exception e) {
            e.printStackTrace();
            redirectAttributes.addFlashAttribute("errorMessage", "Failed to deactivate account due to a server error.");
            return "redirect:/settings";
        }
    }
}