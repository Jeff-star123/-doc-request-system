package com.barangay.doc_request_system.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.barangay.doc_request_system.model.DocumentRequest;
import com.barangay.doc_request_system.model.User;

@Repository
public interface DocumentRequestRepository extends JpaRepository<DocumentRequest, Long> {

    // Existing derived query method
    List<DocumentRequest> findByUser(User user);

    // Stored Procedure call
    @Procedure(name = "GetStatusByUsername")
    List<DocumentRequest> getStatusByUsername(@Param("p_username") String username);

    // Added: Delete all requests owned by a specific user to prevent Foreign Key constraint errors
    @Transactional
    void deleteByUser(User user);
}