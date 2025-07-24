package me.leoo.springboot.libri.resi;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.ordini.Ordine;
import me.leoo.springboot.libri.ordini.OrdineItem;
import me.leoo.springboot.libri.ordini.OrdineItemRepository;
import me.leoo.springboot.libri.ordini.OrdineRepository;
import me.leoo.springboot.libri.resi.chat.Messaggio;
import me.leoo.springboot.libri.resi.chat.TipoMittente;
import me.leoo.springboot.libri.utente.Utente;
import org.hibernate.Hibernate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class ResoService {

    private final ResoRepository resoRepository;
    private final OrdineRepository ordineRepository; // Da creare se non esiste
    private final OrdineItemRepository ordineItemRepository; // Da creare se non esiste

    @Transactional
    public Reso creaReso(ResoController.CreaResoRequest request) {
        Ordine ordine = ordineRepository.findById(request.ordineId())
                .orElseThrow(() -> new EntityNotFoundException("Ordine non trovato con ID: " + request.ordineId()));

        Reso reso = new Reso(ordine, request.metodoRimborso());

        for (ResoController.CreaResoItemRequest itemRequest : request.items()) {
            OrdineItem ordineItem = ordineItemRepository.findById(itemRequest.ordineItemId())
                    .orElseThrow(() -> new EntityNotFoundException("Item dell'ordine non trovato con ID: " + itemRequest.ordineItemId()));

            // Aggiunge l'item al reso usando il metodo esistente
            reso.addItem(ordineItem, itemRequest.motivo(), itemRequest.descrizione(),
                    itemRequest.quantita());
        }

        return resoRepository.save(reso);
    }

    @Transactional
    public Messaggio aggiungiMessaggio(Long resoId, TipoMittente mittente, ResoController.CreaMessaggioRequest request) {
        Reso reso = resoRepository.findById(resoId)
                .orElseThrow(() -> new EntityNotFoundException("Reso non trovato con ID: " + resoId));

        Messaggio messaggio = new Messaggio();
        messaggio.setTesto(request.testo());
        messaggio.setMittente(mittente);
        if (request.allegati() != null) {
            messaggio.setAllegati(request.allegati());
        }

        reso.addMessaggio(messaggio);

        // Poiché la relazione è CascadeType.ALL, salvando il reso si salverà anche il nuovo messaggio.
        resoRepository.save(reso);

        // Ritorna l'ultimo messaggio aggiunto, che ora ha un ID e un timestamp
        return reso.getMessaggi().get(reso.getMessaggi().size() - 1);
    }

    @Transactional(readOnly = false)
    public Reso getResoById(Long id) {
        Reso reso = resoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Reso non trovato con ID: " + id));

        initialize(reso);

        return reso;
    }

    @Transactional(readOnly = false)
    public Reso getResoByIdAndUtente(Long id, Utente utente) {
        Reso reso = resoRepository.findByIdAndOrdineUtenteId(id, utente.getId())
                .orElseThrow(() -> new EntityNotFoundException("Reso con ID " + id + " non trovato per l'utente specificato."));

        initialize(reso);

        return reso;
    }

    @Transactional(readOnly = false)
    public boolean isAssociatedWithUtente(Long id, Utente utente) {
        return resoRepository.existsByIdAndOrdineUtenteId(id, utente.getId());
    }

    @Transactional(readOnly = false)
    public boolean exists(Long id) {
        return resoRepository.existsById(id);
    }

    @Transactional(readOnly = false)
    public Set<Reso> getAllByUtente(Utente utente) {
        return resoRepository.getAllByOrdineUtenteId(utente.getId());
    }

    private void initialize(Reso reso) {
        Hibernate.initialize(reso.getOrdine());
        Hibernate.initialize(reso.getItems());
        Hibernate.initialize(reso.getStati());
        Hibernate.initialize(reso.getMessaggi());
    }
}