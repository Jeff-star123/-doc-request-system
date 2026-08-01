package com.barangay.doc_request_system.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedStoredProcedureQuery;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PrePersist;
import jakarta.persistence.StoredProcedureParameter;
import jakarta.persistence.Table;

@Entity
@Table(name = "document_requests")
@NamedStoredProcedureQuery(
    name = "GetStatusByUsername",
    procedureName = "GetStatusByUsername",
    resultClasses = DocumentRequest.class,
    parameters = {
        @StoredProcedureParameter(mode = ParameterMode.IN, name = "p_username", type = String.class)
    }
)
public class DocumentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "document_type", nullable = false, length = 100)
    private String documentType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String purpose;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "id_card_image_path")
    private String idCardImagePath;

    @Column(name = "selfie_image_path")
    private String selfieImagePath;

    @Column(name = "face_verified")
    private Boolean faceVerified = false;

    @Column(name = "requested_at", updatable = false)
    private LocalDateTime requestedAt;

    // Constructors
    public DocumentRequest() {}

    public DocumentRequest(User user, String documentType, String purpose) {
        this.user = user;
        this.documentType = documentType;
        this.purpose = purpose;
        this.status = "PENDING";
    }

    @PrePersist
    protected void onCreate() {
        if (this.requestedAt == null) {
            this.requestedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }

    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getIdCardImagePath() { return idCardImagePath; }
    public void setIdCardImagePath(String idCardImagePath) { this.idCardImagePath = idCardImagePath; }

    public String getSelfieImagePath() { return selfieImagePath; }
    public void setSelfieImagePath(String selfieImagePath) { this.selfieImagePath = selfieImagePath; }

    public Boolean getFaceVerified() { 
        return faceVerified != null ? faceVerified : false; 
    }
    public void setFaceVerified(Boolean faceVerified) { 
        this.faceVerified = faceVerified != null ? faceVerified : false; 
    }

    public boolean isFaceVerified() { 
        return Boolean.TRUE.equals(this.faceVerified); 
    }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }
}