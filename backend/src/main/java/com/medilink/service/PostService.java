package com.medilink.service;

import com.medilink.model.Post;
import com.medilink.repository.PostRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    public Post createPost(Post post) {
        post.setApprovalStatus(Post.ApprovalStatus.PENDING);
        return postRepository.save(post);
    }

    public List<Post> getApprovedPosts() {
        return postRepository.findByApprovalStatus(Post.ApprovalStatus.APPROVED);
    }

    public List<Post> getPendingPosts() {
        return postRepository.findByApprovalStatus(Post.ApprovalStatus.PENDING);
    }

    public List<Post> getPostsByDoctorId(Long doctorId) {
        return postRepository.findByDoctorId(doctorId);
    }

    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public Post approvePost(Long id) {
        Post post = getPostById(id);
        post.setApprovalStatus(Post.ApprovalStatus.APPROVED);
        return postRepository.save(post);
    }

    public Post rejectPost(Long id) {
        Post post = getPostById(id);
        post.setApprovalStatus(Post.ApprovalStatus.REJECTED);
        return postRepository.save(post);
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }
}
