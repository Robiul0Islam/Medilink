package com.medilink.repository;

import com.medilink.model.Message;
import com.medilink.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE (m.sender.id = :userId1 AND m.receiver.id = :userId2) OR (m.sender.id = :userId2 AND m.receiver.id = :userId1) ORDER BY m.timestamp ASC")
    List<Message> findConversation(Long userId1, Long userId2);
    
    @Query("SELECT DISTINCT u FROM User u WHERE u.id IN (SELECT m.receiver.id FROM Message m WHERE m.sender.id = :userId) OR u.id IN (SELECT m.sender.id FROM Message m WHERE m.receiver.id = :userId)")
    List<User> findConversationPartners(Long userId);
}
