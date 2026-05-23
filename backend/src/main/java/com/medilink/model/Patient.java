package com.medilink.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "patients")
@Data
@EqualsAndHashCode(callSuper = true)
@PrimaryKeyJoinColumn(name = "user_id")
public class Patient extends User {
    
    private String heartRate;
    private String bloodPressure;
    private String glucose;
    private String weight;
    private String height;
    private String bmi;
}
