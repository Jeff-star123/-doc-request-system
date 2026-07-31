package com.barangay.doc_request_system.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.barangay.doc_request_system.model.User;
import com.barangay.doc_request_system.repository.UserRepository;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {
                User admin = new User();
                admin.setFullName("System Administrator"); // Required because full_name cannot be null
                admin.setUsername("admin");
                admin.setPassword("admin123");
                admin.setRole("ADMIN");
                
                userRepository.save(admin);
                System.out.println(">>> Default admin account created successfully! <<<");
            } else {
                System.out.println(">>> Admin account already exists. Skipping initialization. <<<");
            }
        };
    }
}