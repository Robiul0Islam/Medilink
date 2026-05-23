package com.medilink.service;

import com.medilink.model.Report;
import com.medilink.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    public Report createReport(Report report) {
        return reportRepository.save(report);
    }

    public List<Report> getReportsByPatientId(Long patientId) {
        return reportRepository.findByPatientId(patientId);
    }

    public List<Report> getReportsByDoctorId(Long doctorId) {
        return reportRepository.findByDoctorId(doctorId);
    }

    public Report getReportById(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Report not found"));
    }

    public void deleteReport(Long id) {
        reportRepository.deleteById(id);
    }
}
