package me.leoo.springboot.libri.libri.recommendation;

import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
public class LibroRecommendationService {

    @Autowired
    private LibroRepository libroRepository;

    public List<Libro>  getHomepage(int limit) {
        Set<Libro> libri = new HashSet<>();


        List<Libro> newArrivals = libroRepository.findTop10ByOrderByDataAggiuntaDesc();
        addRandomBooks(libri, newArrivals, 5); // Aggiungiamo 5 nuovi arrivi

        List<Libro> booksOnSale = libroRepository.findByInOffertaTrue();
        addRandomBooks(libri, booksOnSale, 6); // Aggiungiamo 6 libri in promozione

        List<Libro> limitedStock = libroRepository.findTop5ByRifornimento_QuantitaBetweenOrderByRifornimento_QuantitaAsc(1, 5);
        addRandomBooks(libri, limitedStock, 4); // Aggiungiamo 2 libri a stock limitato

        if (libri.size() < limit) {
            Set<Long> ids = libri.stream().map(Libro::getId).collect(Collectors.toSet());

            Pageable pageable = Pageable.ofSize(limit - libri.size());
            List<Libro> random = libroRepository.findRandomAvailableBooksExcluding(pageable, ids);

            Collections.shuffle(random);

            addRandomBooks(libri, random, limit - libri.size());
        }

        // --- Ordinamento Finale e Limite ---
        List<Libro> finalRecommendations = new ArrayList<>(libri);

        // Mescola la lista per garantire una variazione ad ogni refresh della pagina
        // Questo è il punto chiave per la dinamicità della homepage ad ogni refresh.
        Collections.shuffle(finalRecommendations, ThreadLocalRandom.current());

        // Limita la lista al numero desiderato (es. 20-30 libri per la homepage)
        return finalRecommendations.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }

    private void addRandomBooks(Set<Libro> destinationSet, List<Libro> sourceList, int count) {
        if (sourceList.isEmpty() || count <= 0) {
            return;
        }

        // Filtra solo i libri in stock prima di mescolare
        List<Libro> availableSource = sourceList.stream()
                .filter(Libro::isInStock)
                .collect(Collectors.toList());

        if (availableSource.isEmpty()) {
            return;
        }

        // Mescola la lista sorgente per prendere elementi casuali
        Collections.shuffle(availableSource, ThreadLocalRandom.current());

        int addedCount = 0;
        for (Libro libro : availableSource) {
            if (addedCount >= count) {
                break;
            }

            // add() ritorna true se l'elemento è stato aggiunto (non era già presente)
            if (destinationSet.add(libro)) {
                addedCount++;
            }
        }
    }
}
