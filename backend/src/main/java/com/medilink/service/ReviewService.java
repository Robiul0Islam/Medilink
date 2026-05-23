package com.medilink.service;

import com.medilink.model.Doctor;
import com.medilink.model.Review;
import com.medilink.repository.DoctorRepository;
import com.medilink.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Transactional
    public Review addReview(Review review) {
        Review saved = reviewRepository.save(review);
        updateDoctorRating(review.getDoctor().getId());
        return saved;
    }

    public List<Review> getReviewsByDoctor(Long doctorId) {
        return reviewRepository.findByDoctorId(doctorId);
    }

    private void updateDoctorRating(Long doctorId) {
        List<Review> reviews = reviewRepository.findByDoctorId(doctorId);
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (reviews.isEmpty()) {
            doctor.setRating(0.0);
            doctor.setReviewCount(0);
        } else {
            double sum = reviews.stream().mapToDouble(Review::getRating).sum();
            doctor.setRating(sum / reviews.size());
            doctor.setReviewCount(reviews.size());
        }
        doctorRepository.save(doctor);
    }
}
