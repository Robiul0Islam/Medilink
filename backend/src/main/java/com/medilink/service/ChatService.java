package com.medilink.service;

import com.medilink.model.Message;
import com.medilink.model.User;
import com.medilink.repository.MessageRepository;
import com.medilink.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatService {

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    public Message sendMessage(Message message) {
        if (message.getIsRead() == null) message.setIsRead(false);
        
        if (message.getSender() == null && message.getSenderId() != null) {
            User sender = userRepository.findById(message.getSenderId()).orElse(null);
            message.setSender(sender);
        }
        if (message.getReceiver() == null && message.getReceiverId() != null) {
            User receiver = userRepository.findById(message.getReceiverId()).orElse(null);
            message.setReceiver(receiver);
        }
        
        return messageRepository.save(message);
    }

    public List<Message> getConversation(Long userId1, Long userId2) {
        List<Message> msgs = messageRepository.findConversation(userId1, userId2);
        msgs.forEach(m -> {
            if (m.getSender() != null) m.setSenderId(m.getSender().getId());
            if (m.getReceiver() != null) m.setReceiverId(m.getReceiver().getId());
        });
        return msgs;
    }

    public List<User> getConversationPartners(Long userId) {
        return messageRepository.findConversationPartners(userId);
    }

    public Message markAsRead(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        message.setIsRead(true);
        return messageRepository.save(message);
    }
}
