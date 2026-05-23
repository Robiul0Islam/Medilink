package com.medilink.service;

import com.medilink.model.Patient;
import com.medilink.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class PatientService {

    @Autowired
    private PatientRepository patientRepository;

    public Patient getPatientById(Long id) {
        return patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
    }

    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = getPatientById(id);
        patient.setName(patientDetails.getName());
        patient.setCity(patientDetails.getCity());
        patient.setAvatar(patientDetails.getAvatar());
        
       
        patient.setHeartRate(patientDetails.getHeartRate());
        patient.setBloodPressure(patientDetails.getBloodPressure());
        patient.setGlucose(patientDetails.getGlucose());
        patient.setWeight(patientDetails.getWeight());
        patient.setHeight(patientDetails.getHeight());
        
        
        patient.setBmi(calculateBmi(patientDetails.getWeight(), patientDetails.getHeight()));
        
        return patientRepository.save(patient);
    }

    public String calculateBmi(String weight, String height) {
        if (weight == null || height == null || weight.isEmpty() || height.isEmpty()) {
            return null;
        }
        try {
            double w = Double.parseDouble(weight.replaceAll("[^\\d.]", ""));
            String hStr = height.toLowerCase();
            double hInMeters = 0;
            
            if (hStr.contains("feet") || hStr.contains("'") || hStr.contains("ft")) {
                double feet = Double.parseDouble(hStr.replaceAll("[^\\d.]", ""));
                hInMeters = feet * 0.3048;
            } else {
                double cm = Double.parseDouble(hStr.replaceAll("[^\\d.]", ""));
                hInMeters = cm / 100.0;
            }

            if (hInMeters > 0) {
                return String.format("%.1f", w / (hInMeters * hInMeters));
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }

    public Patient updateVitals(Long id, Patient vitals) {
        Patient patient = getPatientById(id);
        patient.setHeartRate(vitals.getHeartRate());
        patient.setBloodPressure(vitals.getBloodPressure());
        patient.setGlucose(vitals.getGlucose());
        patient.setWeight(vitals.getWeight());
        patient.setHeight(vitals.getHeight());
        patient.setBmi(vitals.getBmi());
        return patientRepository.save(patient);
    }
}
