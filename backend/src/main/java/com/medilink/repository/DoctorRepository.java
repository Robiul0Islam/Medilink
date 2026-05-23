package com.medilink.repository;

import com.medilink.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    List<Doctor> findByApprovalStatus(Doctor.ApprovalStatus status);
}
