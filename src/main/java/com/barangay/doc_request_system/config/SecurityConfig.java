package com.barangay.doc_request_system.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private ApiGatewayFilter apiGatewayFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            // Guarantee ApiGatewayFilter runs on every request
            .addFilterBefore(apiGatewayFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Public URLs
                .requestMatchers(
                    "/", 
                    "/login", 
                    "/register", 
                    "/request/reactivate",
                    "/spam-banned", 
                    "/css/**", 
                    "/js/**", 
                    "/images/**", 
                    "/favicon.ico"
                ).permitAll()

                // Role-Based Authorization for Admin
                .requestMatchers("/admin/**").hasAnyAuthority("ADMIN", "ROLE_ADMIN")

                // Authenticated Resident Routes
                .requestMatchers("/dashboard", "/settings", "/request/**", "/secure-uploads/**").authenticated()

                // API Gateway / REST Endpoints
                .requestMatchers("/api/requests/telegram/**").permitAll()
                .requestMatchers("/api/requests/**").authenticated()

                // Fallback
                .anyRequest().permitAll()
            )
            .exceptionHandling(exception -> exception
                .authenticationEntryPoint((request, response, authException) -> response.sendRedirect("/"))
                .accessDeniedHandler((request, response, accessDeniedException) -> response.sendRedirect("/"))
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            );

        return http.build();
    }
}