package com.medilink.repository;

import com.medilink.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByApprovalStatus(Post.ApprovalStatus status);
    List<Post> findByDoctorId(Long doctorId);
}
