package me.leoo.springboot.libri.utente.security;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoginHistoryService {

    private final LoginHistoryRepository loginHistoryRepository;

    public List<LoginHistory> getAll(Long userId) {
        return loginHistoryRepository.findByUtente_Id(userId);
    }
}
