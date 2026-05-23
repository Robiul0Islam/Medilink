package com.medilink.controller;

import com.medilink.model.Post;
import com.medilink.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody Post post) {
        try {
            Post created = postService.createPost(post);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<Post>> getApprovedPosts() {
        List<Post> posts = postService.getApprovedPosts();
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Post>> getDoctorPosts(@PathVariable Long doctorId) {
        List<Post> posts = postService.getPostsByDoctorId(doctorId);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPost(@PathVariable Long id) {
        try {
            Post post = postService.getPostById(id);
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @GetMapping("/pending")
    public ResponseEntity<List<Post>> getPendingPosts() {
        return ResponseEntity.ok(postService.getPendingPosts());
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<Post> approvePost(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(postService.approvePost(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<Post> rejectPost(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(postService.rejectPost(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
