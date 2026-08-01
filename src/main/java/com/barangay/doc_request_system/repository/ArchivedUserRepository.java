package com.barangay.doc_request_system.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.barangay.doc_request_system.model.ArchivedUser;

@Repository
public interface ArchivedUserRepository extends JpaRepository<ArchivedUser, Long> {
    Optional<ArchivedUser> findByOriginalUserId(Long originalUserId);
}