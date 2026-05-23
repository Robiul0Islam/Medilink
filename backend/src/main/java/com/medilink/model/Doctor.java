package com.medilink.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "doctors")
@Data
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumn(name = "user_id")
public class Doctor extends User {
    
    private String specialty;
    private Double rating = 0.0;
    private Integer reviewCount = 0;
    private String clinic;
    private String distance;
    private String status;
    private String address;
    private String phone;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;
    
    public enum ApprovalStatus {
        PENDING, APPROVED, REJECTED
    }
}
