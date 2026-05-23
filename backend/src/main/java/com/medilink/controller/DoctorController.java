package com.medilink.controller;

import com.medilink.model.Doctor;
import com.medilink.service.DoctorService;
import com.medilink.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/doctor")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/all")
    public ResponseEntity<List<Doctor>> getAllApprovedDoctors() {
        List<Doctor> doctors = doctorService.getAllApprovedDoctors();
        return ResponseEntity.ok(doctors);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Doctor> getDoctor(@PathVariable Long id) {
        try {
            Doctor doctor = doctorService.getDoctorById(id);
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor doctor) {
        try {
            Doctor updated = doctorService.updateDoctor(id, doctor);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @PostMapping(value = "/{id}/profile/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Doctor> updateProfileWithAvatar(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("city") String city,
            @RequestParam("specialty") String specialty,
            @RequestParam("clinic") String clinic,
            @RequestParam(value = "address", required = false) String address,
            @RequestParam(value = "phone", required = false) String phone) {
        try {
            Doctor details = new Doctor();
            details.setName(name);
            details.setCity(city);
            details.setSpecialty(specialty);
            details.setClinic(clinic);
            details.setAddress(address);
            details.setPhone(phone);

            if (file != null && !file.isEmpty()) {
                String avatarUrl = fileStorageService.saveWithSubfolder(file, "avatars");
                details.setAvatar(avatarUrl);
            } else {
                Doctor existing = doctorService.getDoctorById(id);
                details.setAvatar(existing.getAvatar());
            }

            Doctor updated = doctorService.updateDoctor(id, details);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
