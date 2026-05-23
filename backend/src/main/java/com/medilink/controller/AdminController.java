package com.medilink.controller;

import com.medilink.model.Doctor;
import com.medilink.model.Post;
import com.medilink.service.DoctorService;
import com.medilink.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private PostService postService;

    @GetMapping("/doctors/pending")
    public ResponseEntity<List<Doctor>> getPendingDoctors() {
        List<Doctor> doctors = doctorService.getPendingDoctors();
        return ResponseEntity.ok(doctors);
    }

    @PutMapping("/doctors/{id}/approve")
    public ResponseEntity<Doctor> approveDoctor(@PathVariable Long id) {
        try {
            Doctor doctor = doctorService.approveDoctor(id);
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/doctors/{id}/reject")
    public ResponseEntity<Doctor> rejectDoctor(@PathVariable Long id) {
        try {
            Doctor doctor = doctorService.rejectDoctor(id);
            return ResponseEntity.ok(doctor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/posts/pending")
    public ResponseEntity<List<Post>> getPendingPosts() {
        List<Post> posts = postService.getPendingPosts();
        return ResponseEntity.ok(posts);
    }

    @PutMapping("/posts/{id}/approve")
    public ResponseEntity<Post> approvePost(@PathVariable Long id) {
        try {
            Post post = postService.approvePost(id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/posts/{id}/reject")
    public ResponseEntity<Post> rejectPost(@PathVariable Long id) {
        try {
            Post post = postService.rejectPost(id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("pendingDoctors", doctorService.getPendingDoctors().size());
        stats.put("approvedDoctors", doctorService.getAllApprovedDoctors().size());
        stats.put("pendingPosts", postService.getPendingPosts().size());
        stats.put("approvedPosts", postService.getApprovedPosts().size());
        return ResponseEntity.ok(stats);
    }
}
