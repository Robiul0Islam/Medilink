package com.medilink.controller;

import com.medilink.model.Message;
import com.medilink.model.User;
import com.medilink.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/messages")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        try {
            Message sent = chatService.sendMessage(message);
            return ResponseEntity.ok(sent);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/messages/{userId1}/{userId2}")
    public ResponseEntity<List<Message>> getConversation(
            @PathVariable Long userId1, 
            @PathVariable Long userId2) {
        List<Message> messages = chatService.getConversation(userId1, userId2);
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/conversations/{userId}")
    public ResponseEntity<List<User>> getConversationPartners(@PathVariable Long userId) {
        List<User> partners = chatService.getConversationPartners(userId);
        return ResponseEntity.ok(partners);
    }

    @PutMapping("/messages/{messageId}/read")
    public ResponseEntity<Message> markAsRead(@PathVariable Long messageId) {
        try {
            Message message = chatService.markAsRead(messageId);
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
