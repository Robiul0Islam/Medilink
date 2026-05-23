package com.medilink.controller;

import com.medilink.model.Patient;
import com.medilink.service.FileStorageService;
import com.medilink.service.PatientService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/patient")
public class PatientController {

    @Autowired
    private PatientService patientService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/{id}")
    public ResponseEntity<Patient> getPatient(@PathVariable Long id) {
        try {
            Patient patient = patientService.getPatientById(id);
            return ResponseEntity.ok(patient);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Patient> updatePatient(@PathVariable Long id, @RequestBody Patient patient) {
        try {
            Patient updated = patientService.updatePatient(id, patient);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/vitals")
    public ResponseEntity<Patient> updateVitals(@PathVariable Long id, @RequestBody Patient vitals) {
        try {
            Patient updated = patientService.updateVitals(id, vitals);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @PostMapping(value = "/{id}/profile/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Patient> updateProfileWithAvatar(
            @PathVariable Long id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("city") String city,
            @RequestParam(value = "heartRate", required = false) String heartRate,
            @RequestParam(value = "bloodPressure", required = false) String bloodPressure,
            @RequestParam(value = "glucose", required = false) String glucose,
            @RequestParam(value = "weight", required = false) String weight,
            @RequestParam(value = "height", required = false) String height) {
        try {
            Patient details = new Patient();
            details.setName(name);
            details.setCity(city);
            details.setHeartRate(heartRate);
            details.setBloodPressure(bloodPressure);
            details.setGlucose(glucose);
            details.setWeight(weight);
            details.setHeight(height);

            if (file != null && !file.isEmpty()) {
                String avatarUrl = fileStorageService.saveWithSubfolder(file, "avatars");
                details.setAvatar(avatarUrl);
            } else {
                Patient existing = patientService.getPatientById(id);
                details.setAvatar(existing.getAvatar());
            }

            Patient updated = patientService.updatePatient(id, details);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}
