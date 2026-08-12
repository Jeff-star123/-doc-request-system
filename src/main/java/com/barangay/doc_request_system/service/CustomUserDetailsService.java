package com.barangay.doc_request_system.service;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.barangay.doc_request_system.model.User;
import com.barangay.doc_request_system.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Account Status Guardrails
        if ("BANNED".equalsIgnoreCase(user.getStatus())) {
            throw new DisabledException("Your account has been permanently banned by the Barangay Administrator.");
        }

        if ("DEACTIVATED".equalsIgnoreCase(user.getStatus()) || "REACTIVATION_PENDING".equalsIgnoreCase(user.getStatus())) {
            throw new DisabledException("Your account is deactivated or pending admin reactivation.");
        }

        String roleName = user.getRole().startsWith("ROLE_") ? user.getRole() : "ROLE_" + user.getRole();

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.isEnabled(),
                true, true, true,
                Collections.singletonList(new SimpleGrantedAuthority(roleName))
        );
    }
}