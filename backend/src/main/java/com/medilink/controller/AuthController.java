package com.medilink.controller;

import com.medilink.dto.AuthResponse;
import com.medilink.dto.LoginRequest;
import com.medilink.dto.RegisterRequest;
import com.medilink.model.User;
import com.medilink.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            String email = authentication.getName();
            User user = authService.getCurrentUser(email);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }

    // Inner class for error response
    static class ErrorResponse {
        private String message;
        public ErrorResponse(String message) { this.message = message; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    @PutMapping("/password")
    public ResponseEntity<java.util.Map<String, String>> changePassword(
            @RequestBody com.medilink.dto.ChangePasswordRequest request,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            System.out.println("Password change request for: " + email);
            
            User user = authService.getCurrentUser(email);
            authService.changePassword(user.getId(), request.getCurrentPassword(), request.getNewPassword());
            
            System.out.println("Password changed successfully for: " + email);
            return ResponseEntity.ok(java.util.Collections.singletonMap("message", "Password updated successfully"));
        } catch (Exception e) {
            System.err.println("Password change failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(java.util.Collections.singletonMap("error", e.getMessage()));
        }
    }
}
