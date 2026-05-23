package com.medilink.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;
    
    @Column(nullable = false)
    private String title;
    
    private String reportType; // Prescription, Test Report, etc.
    
    @Column(length = 2000)
    private String description;
    
    private String fileUrl;
    
    @Column(nullable = false)
    private LocalDate reportDate;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
