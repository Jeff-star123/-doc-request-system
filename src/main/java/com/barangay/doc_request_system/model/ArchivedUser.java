package com.barangay.doc_request_system.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "archived_users")
public class ArchivedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "original_user_id", nullable = false)
    private Long originalUserId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String username;

    @Column(name = "telegram_chat_id")
    private String telegramChatId;

    @Column(name = "deactivated_at", nullable = false)
    private LocalDateTime deactivatedAt;

    public ArchivedUser() {}

    public ArchivedUser(User user) {
        this.originalUserId = user.getId();
        this.fullName = user.getFullName();
        this.username = user.getUsername();
        this.telegramChatId = user.getTelegramChatId();
        this.deactivatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOriginalUserId() { return originalUserId; }
    public void setOriginalUserId(Long originalUserId) { this.originalUserId = originalUserId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getTelegramChatId() { return telegramChatId; }
    public void setTelegramChatId(String telegramChatId) { this.telegramChatId = telegramChatId; }

    public LocalDateTime getDeactivatedAt() { return deactivatedAt; }
    public void setDeactivatedAt(LocalDateTime deactivatedAt) { this.deactivatedAt = deactivatedAt; }
}