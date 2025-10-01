package me.leoo.springboot.libri.ordini;

import me.leoo.springboot.libri.utente.Utente;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrdineService {

    @Autowired
    private OrdineRepository ordineRepository;


    public Ordine getOrdineById(long id) throws Exception {
        Ordine ordine = ordineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordine non trovato con ID: " + id));

        return init(ordine);
    }

    public Ordine getOrdineById(Utente utente, long id)  throws Exception {
        Ordine ordine = ordineRepository.findByIdAndUtente(id, utente)
                .orElseThrow(() -> new RuntimeException("Ordine non trovato con ID: " + id));

        return init(ordine);
    }

    public Ordine init(Ordine ordine) {
        Hibernate.initialize(ordine.getItems());
        Hibernate.initialize(ordine.getCouponCodes());
        Hibernate.initialize(ordine.getStati());
        return ordine;
    }

    public List<Ordine> getAllOrdini(Utente utente) {
        List<Ordine> ordini = ordineRepository.findAllByUtente(utente);

        return ordini;
    }

    public boolean existsOrdine(long id){
        return ordineRepository.existsById(id);
    }

    public boolean existsOrdine(Utente utente, long id) {
        return ordineRepository.existsByIdAndUtente(id, utente);
    }

    public Ordine inviaOrdine(Ordine ordine) {
        return ordineRepository.save(ordine);
    }

}
