package com.medilink.controller;

import com.medilink.model.Patient;
import com.medilink.model.Report;
import com.medilink.service.FileStorageService;
import com.medilink.service.PatientService;
import com.medilink.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private PatientService patientService;

    @PostMapping
    public ResponseEntity<Report> createReport(@RequestBody Report report) {
        try {
            Report created = reportService.createReport(report);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Report> uploadReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") Long patientId,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "heartRate", required = false) String heartRate,
            @RequestParam(value = "bloodPressure", required = false) String bloodPressure,
            @RequestParam(value = "glucose", required = false) String glucose,
            @RequestParam(value = "weight", required = false) String weight,
            @RequestParam(value = "height", required = false) String height,
            @RequestParam(value = "doctorId", required = false) Long doctorId,
            @RequestParam(value = "reportType", required = false) String reportType) {
        try {
            String fileUrl = fileStorageService.save(file);

            Patient vitals = new Patient();
            vitals.setHeartRate(heartRate);
            vitals.setBloodPressure(bloodPressure);
            vitals.setGlucose(glucose);
            vitals.setWeight(weight);
            vitals.setHeight(height);
            
            if (weight != null && height != null && !weight.isEmpty() && !height.isEmpty()) {
                try {
                    double w = Double.parseDouble(weight);
                    double h = Double.parseDouble(height) / 100.0;
                    if (h > 0) {
                        double bmiValue = w / (h * h);
                        vitals.setBmi(String.format("%.1f", bmiValue));
                    }
                } catch (Exception e) {
                    // Ignore parsing errors
                }
            }
            
            patientService.updateVitals(patientId, vitals);

            Report report = new Report();
            Patient patient = new Patient();
            patient.setId(patientId);
            report.setPatient(patient);
            
            if (doctorId != null) {
                com.medilink.model.Doctor doctor = new com.medilink.model.Doctor();
                doctor.setId(doctorId);
                report.setDoctor(doctor);
            }

            report.setTitle(title);
            report.setDescription(description);
            report.setFileUrl(fileUrl);
            report.setReportDate(LocalDate.now());
            report.setReportType(reportType != null ? reportType : "Patient Upload");

            Report created = reportService.createReport(report);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Report>> getPatientReports(@PathVariable Long patientId) {
        List<Report> reports = reportService.getReportsByPatientId(patientId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Report>> getDoctorReports(@PathVariable Long doctorId) {
        List<Report> reports = reportService.getReportsByDoctorId(doctorId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Report> getReport(@PathVariable Long id) {
        try {
            Report report = reportService.getReportById(id);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        try {
            reportService.deleteReport(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
