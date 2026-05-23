package com.medilink.controller;

import com.medilink.model.Review;
import com.medilink.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @PostMapping
    public ResponseEntity<Review> addReview(@RequestBody Review review) {
        try {
            Review created = reviewService.addReview(review);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Review>> getDoctorReviews(@PathVariable Long doctorId) {
        List<Review> reviews = reviewService.getReviewsByDoctor(doctorId);
        return ResponseEntity.ok(reviews);
    }
}
