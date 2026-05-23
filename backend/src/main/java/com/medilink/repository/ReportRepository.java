package com.medilink.repository;

import com.medilink.model.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    List<Report> findByPatientId(Long patientId);
    List<Report> findByDoctorId(Long doctorId);
}
