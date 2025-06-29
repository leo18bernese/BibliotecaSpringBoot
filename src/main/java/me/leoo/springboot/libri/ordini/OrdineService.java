package me.leoo.springboot.libri.ordini;

import me.leoo.springboot.libri.utente.Utente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrdineService {

    @Autowired
    private OrdineRepository ordineRepository;

    public Ordine getOrdineById(Utente utente, long id) {
        return ordineRepository.findByIdAndUtente(id, utente)
                .orElseThrow(() -> new RuntimeException("Ordine non trovato con ID: " + id));
    }

    public boolean existsOrdine(Utente utente, long id) {
        return ordineRepository.existsByIdAndUtente(id, utente);
    }

    public Ordine inviaOrdine(Ordine ordine) {
       return ordineRepository.save(ordine);
    }
}
