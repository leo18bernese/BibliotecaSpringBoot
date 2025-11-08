package me.leoo.springboot.libri.ordini;

import me.leoo.springboot.libri.analytics.InteractionEnum;
import me.leoo.springboot.libri.analytics.service.AnalyticsWriteService;
import me.leoo.springboot.libri.utente.Utente;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class OrdineService {

    @Autowired
    private OrdineRepository ordineRepository;

    @Autowired
    private AnalyticsWriteService analyticsWriteService;


    public Ordine getOrdineById(long id) throws Exception {
        Ordine ordine = ordineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordine non trovato con ID: " + id));

        return init(ordine);
    }

    public Ordine getOrdineById(Utente utente, long id) throws Exception {
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
        return ordineRepository.findAllByUtente(utente);
    }

    public Page<Ordine> getAllOrdiniPaged(Utente utente, Pageable pageable) {
        return ordineRepository.findAllByUtente(utente, pageable);
    }

    public boolean existsOrdine(long id) {
        return ordineRepository.existsById(id);
    }

    public boolean existsOrdine(Utente utente, long id) {
        return ordineRepository.existsByIdAndUtente(id, utente);
    }

    public Ordine inviaOrdine(Ordine ordine) {
        Ordine savedOrdine = ordineRepository.save(ordine);

        for (OrdineItem item : savedOrdine.getItems()) {
            System.out.println("Recording COMPLETE_PURCHASE for libroId: " + item.getLibroId() + ", categoryId: " + item.getCategoryId());
            analyticsWriteService.recordEvent(
                    item.getLibroId(),
                    item.getCategoryId(),
                    savedOrdine.getUtente().getId(),
                    InteractionEnum.COMPLETE_PURCHASE,
                    new Date()
            );

            System.out.println("Incrementing totalRevenue and totalUnitsSold for libroId: " + item.getLibroId() + ", categoryId: " + item.getCategoryId());

            analyticsWriteService.incrementBaseValues(
                    "all_time_analytics",
                    item.getLibroId(),
                    item.getCategoryId(),
                    null,
                    "totalUnitsSold",
                    1
            );
        }

        return savedOrdine;
    }

}
