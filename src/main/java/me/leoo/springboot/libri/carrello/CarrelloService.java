package me.leoo.springboot.libri.carrello;

import me.leoo.springboot.libri.buono.Buono;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.utente.Utente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CarrelloService {

    @Autowired
    private CarrelloRepository carrelloRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Transactional(readOnly = true)
    public Carrello getCarrelloByUtente(Utente utente) {
        return carrelloRepository.findByUtente(utente)
                .orElseThrow(() -> new RuntimeException("Carrello non trovato per l'utente: " + utente.getUsername()));
    }

    @Transactional
    public Carrello addItemToCarrello(Utente utente, Long libroId, int quantita) {
        Carrello carrello = getCarrelloByUtente(utente);

        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro non trovato con ID: " + libroId));

        carrello.addItem(libro, quantita);
        return carrelloRepository.save(carrello);
    }

    @Transactional
    public Carrello removeItemFromCarrello(Utente utente, Long libroId, int quantita) {
        Carrello carrello = getCarrelloByUtente(utente);
        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro non trovato con ID: " + libroId));

        carrello.removeItem(libro, quantita);
        return carrelloRepository.save(carrello);
    }

    @Transactional(readOnly = true)
    public CarrelloItem getCarrelloItem(Utente utente, Long libroId) {
        Carrello carrello = getCarrelloByUtente(utente);
        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro non trovato con ID: " + libroId));

        return carrello.getItem(libro);
    }

    @Transactional
    public Carrello addCoupon(Utente utente, Buono coupon) {

        Carrello carrello = getCarrelloByUtente(utente);

        if (carrello.getCouponCodes().contains(coupon)) {
            throw new RuntimeException("Il coupon è già stato applicato al carrello.");
        }

        try {
           coupon.validate(utente, carrello);
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }

        carrello.getCouponCodes().add(coupon);
        return carrelloRepository.save(carrello);
    }

    @Transactional
    public Carrello removeCoupon(Utente utente, Buono coupon) {
        Carrello carrello = getCarrelloByUtente(utente);

        if (!carrello.getCouponCodes().contains(coupon)) {
            throw new RuntimeException("Il coupon non è presente nel carrello.");
        }

        carrello.getCouponCodes().remove(coupon);
        return carrelloRepository.save(carrello);
    }
}