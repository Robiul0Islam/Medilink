package com.medilink.service;

import com.medilink.dto.AuthResponse;
import com.medilink.dto.LoginRequest;
import com.medilink.dto.RegisterRequest;
import com.medilink.model.Admin;
import com.medilink.model.Doctor;
import com.medilink.model.Patient;
import com.medilink.model.User;
import com.medilink.repository.UserRepository;
import com.medilink.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user;
        User.Role role = User.Role.valueOf(request.getRole().toUpperCase());

        switch (role) {
            case PATIENT:
                Patient patient = new Patient();
                patient.setEmail(request.getEmail());
                patient.setPassword(passwordEncoder.encode(request.getPassword()));
                patient.setName(request.getName());
                patient.setRole(User.Role.PATIENT);
                patient.setCity(request.getCity());
                patient.setAvatar("https://randomuser.me/api/portraits/lego/1.jpg");
                user = userRepository.save(patient);
                break;

            case DOCTOR:
                Doctor doctor = new Doctor();
                doctor.setEmail(request.getEmail());
                doctor.setPassword(passwordEncoder.encode(request.getPassword()));
                doctor.setName(request.getName());
                doctor.setRole(User.Role.DOCTOR);
                doctor.setCity(request.getCity());
                doctor.setSpecialty(request.getSpecialty());
                doctor.setClinic(request.getClinic());
                doctor.setDistance(request.getDistance());
                doctor.setAddress(request.getAddress());
                doctor.setPhone(request.getPhone());
                doctor.setStatus("Available");
                doctor.setApprovalStatus(Doctor.ApprovalStatus.PENDING);
                doctor.setAvatar("https://randomuser.me/api/portraits/lego/2.jpg");
                user = userRepository.save(doctor);
                break;

            case ADMIN:
                Admin admin = new Admin();
                admin.setEmail(request.getEmail());
                admin.setPassword(passwordEncoder.encode(request.getPassword()));
                admin.setName(request.getName());
                admin.setRole(User.Role.ADMIN);
                admin.setCity(request.getCity());
                admin.setAvatar("https://randomuser.me/api/portraits/lego/3.jpg");
                user = userRepository.save(admin);
                break;

            default:
                throw new RuntimeException("Invalid role");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getAvatar(),
                user.getCity()
        );
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Check if doctor is approved
        if (user.getRole() == User.Role.DOCTOR) {
            Doctor doctor = (Doctor) user;
            if (doctor.getApprovalStatus() != Doctor.ApprovalStatus.APPROVED) {
                throw new RuntimeException("Doctor account is pending approval");
            }
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.getAvatar(),
                user.getCity()
        );
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
