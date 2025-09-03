package me.leoo.springboot.libri.carrello;

import me.leoo.springboot.libri.buono.Buono;
import me.leoo.springboot.libri.carrello.item.CarrelloItem;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.libri.variante.Variante;
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

    @Transactional(readOnly = false)
    public Carrello getCarrelloByUtente(Utente utente) {
        return carrelloRepository.findByUtente(utente)
                .orElseGet(() -> {
                    Carrello carrello = new Carrello(utente);
                    carrelloRepository.save(carrello);
                    return carrello;
                });
    }

    @Transactional
    public Carrello addItemToCarrello(Utente utente, Long libroId, Long varianteId, int quantita) {
        Carrello carrello = getCarrelloByUtente(utente);

        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro non trovato con ID: " + libroId));

        Variante variante = libro.getVariante(varianteId)
                .orElseThrow(() -> new RuntimeException("Variante non trovata"));

        carrello.addItem(variante, quantita);
        return carrelloRepository.save(carrello);
    }

    @Transactional
    public Carrello removeItemFromCarrello(Utente utente, Long libroId, Long varianteId, int quantita) {
        Carrello carrello = getCarrelloByUtente(utente);

        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro non trovato con ID: " + libroId));

        Variante variante = libro.getVariante(varianteId)
                .orElseThrow(() -> new RuntimeException("Variante non trovata"));

        carrello.removeItem(variante, quantita);
        return carrelloRepository.save(carrello);
    }

    @Transactional
    public Carrello setItemQuantity(Utente utente, Long libroId, Long varianteId, int quantita) {
        Carrello carrello = getCarrelloByUtente(utente);

        Libro libro = libroRepository.findById(libroId)
                .orElseThrow(() -> new RuntimeException("Libro non trovato con ID: " + libroId));

        Variante variante = libro.getVariante(varianteId)
                .orElseThrow(() -> new RuntimeException("Variante non trovata"));

        carrello.setItemQuantity(variante, quantita);
        return carrelloRepository.save(carrello);
    }

    @Transactional(readOnly = false)
    public CarrelloItem getCarrelloItem(Utente utente, Long libroId) {
        Carrello carrello = getCarrelloByUtente(utente);

        return carrello.getItemByBook(libroId);
    }

    @Transactional(readOnly = false)
    public CarrelloItem getCarrelloItemByVariante(Utente utente,  Long varianteId) {
        Carrello carrello = getCarrelloByUtente(utente);

        return carrello.getItemByVariante(varianteId);
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