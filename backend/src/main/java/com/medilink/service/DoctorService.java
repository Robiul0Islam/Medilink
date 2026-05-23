package com.medilink.service;

import com.medilink.model.Doctor;
import com.medilink.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    public List<Doctor> getAllApprovedDoctors() {
        return doctorRepository.findByApprovalStatus(Doctor.ApprovalStatus.APPROVED);
    }

    public List<Doctor> getPendingDoctors() {
        return doctorRepository.findByApprovalStatus(Doctor.ApprovalStatus.PENDING);
    }

    public Doctor getDoctorById(Long id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
    }

    public Doctor updateDoctor(Long id, Doctor doctorDetails) {
        Doctor doctor = getDoctorById(id);
        
        if (doctorDetails.getName() != null) doctor.setName(doctorDetails.getName());
        if (doctorDetails.getSpecialty() != null) doctor.setSpecialty(doctorDetails.getSpecialty());
        if (doctorDetails.getClinic() != null) doctor.setClinic(doctorDetails.getClinic());
        if (doctorDetails.getCity() != null) doctor.setCity(doctorDetails.getCity());
        if (doctorDetails.getAvatar() != null) doctor.setAvatar(doctorDetails.getAvatar());
        if (doctorDetails.getAddress() != null) doctor.setAddress(doctorDetails.getAddress());
        if (doctorDetails.getPhone() != null) doctor.setPhone(doctorDetails.getPhone());
        
        // Reset approval status on any profile change
        doctor.setApprovalStatus(Doctor.ApprovalStatus.PENDING);
        
        return doctorRepository.save(doctor);
    }

    public Doctor approveDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        doctor.setApprovalStatus(Doctor.ApprovalStatus.APPROVED);
        return doctorRepository.save(doctor);
    }

    public Doctor rejectDoctor(Long id) {
        Doctor doctor = getDoctorById(id);
        doctor.setApprovalStatus(Doctor.ApprovalStatus.REJECTED);
        return doctorRepository.save(doctor);
    }
}
