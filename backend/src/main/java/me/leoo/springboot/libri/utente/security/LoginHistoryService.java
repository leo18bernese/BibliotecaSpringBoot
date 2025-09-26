package me.leoo.springboot.libri.utente.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LoginHistoryService {

    private final LoginHistoryRepository loginHistoryRepository;

    public List<LoginHistory> getAll(Long userId) {
        return loginHistoryRepository.findByUtente_Id(userId);
    }

    public Page<LoginHistory> getAll(Long userId, Pageable pageable) {
        return loginHistoryRepository.findByUtente_Id(userId, pageable);
    }
}
