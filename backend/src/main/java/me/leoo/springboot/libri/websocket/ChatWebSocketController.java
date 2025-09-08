package me.leoo.springboot.libri.websocket;

import me.leoo.springboot.libri.resi.chat.Messaggio;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class ChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyNewMessage(String resoId, Messaggio messaggio) {
        messagingTemplate.convertAndSend("/topic/resi/" + resoId, messaggio);
    }
}
