package com.medilink.controller;

import com.medilink.model.Message;
import com.medilink.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWSController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ChatService chatService;

    @MessageMapping("/chat.send")
    public void processMessage(@Payload Message message) {
        Long rId = message.getReceiverId();
        Long sId = message.getSenderId();
        
        
        Message saved = chatService.sendMessage(message);
        
        
        saved.setReceiverId(rId);
        saved.setSenderId(sId);
        
        
        messagingTemplate.convertAndSend(
            "/topic/messages/" + rId, 
            saved
        );
    }
}
