package com.barangay.doc_request_system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // ADDED

import com.barangay.doc_request_system.model.User;
import com.barangay.doc_request_system.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(); // ADDED
                
                User admin = new User();
                admin.setFullName("System Administrator");
                admin.setUsername("admin");
                admin.setPassword(encoder.encode("admin123")); // HASHED HERE!
                admin.setRole("ADMIN");
                
                userRepository.save(admin);
                System.out.println(">>> Default admin account created with hashed password! <<<");
            } else {
                System.out.println(">>> Admin account already exists. Skipping initialization. <<<");
            }
        };
    }
}