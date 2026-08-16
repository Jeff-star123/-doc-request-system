package com.barangay.doc_request_system.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.barangay.doc_request_system.model.DocumentRequest;
import com.barangay.doc_request_system.model.User;
import com.barangay.doc_request_system.repository.DocumentRequestRepository;
import com.barangay.doc_request_system.repository.UserRepository;

@Controller
@RequestMapping("/secure-uploads")
public class FileAccessController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentRequestRepository requestRepository;

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getSecureFile(@PathVariable String filename) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // 1. Check if user is logged in
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String username = auth.getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        boolean isAdmin = "ADMIN".equalsIgnoreCase(currentUser.getRole()) || "ROLE_ADMIN".equalsIgnoreCase(currentUser.getRole());

        // 2. Strict Privacy Check: If NOT admin, check if the file belongs to this user!
        if (!isAdmin) {
            List<DocumentRequest> userRequests = requestRepository.findByUser(currentUser);
            boolean isOwner = userRequests.stream().anyMatch(req -> 
                (req.getIdCardImagePath() != null && req.getIdCardImagePath().contains(filename)) ||
                (req.getSelfieImagePath() != null && req.getSelfieImagePath().contains(filename))
            );

            if (!isOwner) {
                // Block other logged-in residents from viewing photos that do not belong to them!
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        // Sanitize filename to prevent Path Traversal
        String sanitizedFilename = Paths.get(filename).getFileName().toString();
        Path filePath = Paths.get("uploads").resolve(sanitizedFilename).normalize();

        try {
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "no-cache, no-store, must-revalidate")
                    .header(HttpHeaders.PRAGMA, "no-cache")
                    .header(HttpHeaders.EXPIRES, "0")
                    .body(resource);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}