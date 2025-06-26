package me.leoo.springboot.libri.buono;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BuonoService {

    @Autowired
    private BuonoRepository buonoRepository;

    public Buono getBuonoByCodice(String codice) {
        return buonoRepository.findByCodice(codice)
                .orElseThrow(() -> new RuntimeException("Buono non trovato con codice: " + codice));
    }
}
