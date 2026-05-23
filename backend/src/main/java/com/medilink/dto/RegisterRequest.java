package com.medilink.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String email;
    private String password;
    private String name;
    private String role; // PATIENT, DOCTOR, ADMIN
    private String city;
    
    
    private String specialty;
    private String clinic;
    private String distance;
    private String address;
    private String phone;
}
