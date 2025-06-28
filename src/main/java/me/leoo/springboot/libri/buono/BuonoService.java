package me.leoo.springboot.libri.buono;

import me.leoo.springboot.libri.carrello.CarrelloService;
import me.leoo.springboot.libri.utente.Utente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BuonoService {

    @Autowired
    private BuonoRepository buonoRepository;

    @Autowired
    private CarrelloService carrelloService;

    public Buono getBuonoByCodice(Utente utente, String codice) {
        Buono buono = buonoRepository.findByCodice(codice)
                .orElseThrow(() -> new RuntimeException("Buono non trovato con codice: " + codice));

        if (!buono.checkState()) {
            carrelloService.removeCoupon(utente, buono);
            throw new RuntimeException("Il buono non è più valido.");
        }

        return buono;
    }
}
