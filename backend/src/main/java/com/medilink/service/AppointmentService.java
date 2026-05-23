package com.medilink.service;

import com.medilink.model.Appointment;
import com.medilink.model.Doctor;
import com.medilink.model.Patient;
import com.medilink.repository.AppointmentRepository;
import com.medilink.repository.DoctorRepository;
import com.medilink.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    public Appointment createAppointment(Appointment appointment) {
        // Validation: Prevent duplicate active appointments (PENDING or SCHEDULED)
        List<Appointment> existing = appointmentRepository.findByPatientId(appointment.getPatient().getId());
        boolean hasActive = existing.stream().anyMatch(a -> 
            a.getDoctor().getId().equals(appointment.getDoctor().getId()) && 
            (a.getStatus() == Appointment.AppointmentStatus.PENDING || a.getStatus() == Appointment.AppointmentStatus.SCHEDULED)
        );
        
        if (hasActive) {
            throw new RuntimeException("You already have an active appointment or request with this doctor.");
        }
        
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getAppointmentsByDoctorId(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
    }

    public Appointment updateAppointment(Long id, Appointment appointmentDetails) {
        Appointment appointment = getAppointmentById(id);
        if (appointmentDetails.getAppointmentDate() != null) {
            appointment.setAppointmentDate(appointmentDetails.getAppointmentDate());
        }
        if (appointmentDetails.getAppointmentTime() != null) {
            appointment.setAppointmentTime(appointmentDetails.getAppointmentTime());
        }
        if (appointmentDetails.getStatus() != null) {
            appointment.setStatus(appointmentDetails.getStatus());
        }
        if (appointmentDetails.getNotes() != null) {
            appointment.setNotes(appointmentDetails.getNotes());
        }
        return appointmentRepository.save(appointment);
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}
