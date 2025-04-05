package me.leoo.springboot.libri.libri;

import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.carrello.CarrelloRepository;
import me.leoo.springboot.libri.recensioni.Recensione;
import me.leoo.springboot.libri.recensioni.RecensioneRepository;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import me.leoo.springboot.libri.utente.UtenteService;
import org.apache.catalina.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private CarrelloRepository carrelloRepository;

    @Autowired
    private RecensioneRepository recensioneRepository;

    @Autowired
    private UtenteService utenteService;

    @Override
    public void run(String... args) throws Exception {
        libroRepository.save(new Libro("Moby Dick", "Herman Melville", "Avventura", 1851, 624, 3, 15.00));
        libroRepository.save(new Libro("1984", "George Orwell", "Distopia", 1949, 328, 5, 12.50));
        libroRepository.save(new Libro("Il Codice da Vinci", "Dan Brown", "Thriller", 2003, 656, 20, 18.00));
        libroRepository.save(new Libro("Orgoglio e Pregiudizio", "Jane Austen", "Romanzo", 1813, 432, 2, 10.99));
        libroRepository.save(new Libro("Harry Potter e la pietra filosofale", "J.K. Rowling", "Fantasy", 1997, 309, 0, 13.50));
        libroRepository.save(new Libro("Il Nome della Rosa", "Umberto Eco", "Giallo storico", 1980, 512, 10, 16.00));
        libroRepository.save(new Libro("Se questo è un uomo", "Primo Levi", "Memoria", 1947, 206, 18, 12.00));
        libroRepository.save(new Libro("Il Gattopardo", "Giuseppe Tomasi di Lampedusa", "Romanzo storico", 1958, 320, 0, 14.50));
        libroRepository.save(new Libro("La Divina Commedia", "Dante Alighieri", "Poema", 1320, 798, 3, 20.00));
        libroRepository.save(new Libro("I Promessi Sposi", "Alessandro Manzoni", "Romanzo", 1827, 720, 7, 18.00));

        List<Libro> libri = libroRepository.findAll();
        System.out.println("Libri caricati nel database: " + libri.size());

        Utente u = new Utente("Daniel18", "ciao1234", "Daniel", "Bello", "daniel@gmail.com");
        Utente uu = utenteService.register(u);

        Carrello carrello = new Carrello(uu);
        carrelloRepository.save(carrello);


        for (Libro libro : libri) {
            for (int i = 0; i < 3; i++) {
                Recensione recensione = new Recensione(libro.getId(), uu.getId(), "Molto bello", "Ottimo libro, lo consiglio", 4, true, true, new Date(), new Date());
                Recensione r = recensioneRepository.save(recensione);

                libro.getRecensioni().add(r.getId());
            }

            libroRepository.save(libro);
        }


        System.out.println("Libri caricati nel database");
    }
}
