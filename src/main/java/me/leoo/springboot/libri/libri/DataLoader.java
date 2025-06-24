package me.leoo.springboot.libri.libri;

import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.carrello.CarrelloRepository;
import me.leoo.springboot.libri.recensioni.Recensione;
import me.leoo.springboot.libri.recensioni.RecensioneRepository;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import me.leoo.springboot.libri.utente.UtenteService;
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
        if (libroRepository.existsById(1L)) {
            System.out.println("Libri già caricati nel database, salto il caricamento");
            return;
        }

        libroRepository.save(new Libro("Il Signore degli Anelli", "J.R.R. Tolkien", "Fantasy", 1954, 1200, "George Allen & Unwin", "Italiano", "978-8845292613", 50, 25.00));
        libroRepository.save(new Libro("Dune", "Frank Herbert", "Fantascienza", 1965, 800, "Chilton Books", "Italiano", "978-8834710186", 30, 20.50));
        libroRepository.save(new Libro("Il Codice Da Vinci", "Dan Brown", "Thriller", 2003, 592, "Doubleday", "Italiano", "978-8804519962", 75, 15.75));
        libroRepository.save(new Libro("Harry Potter e la Pietra Filosofale", "J.K. Rowling", "Fantasy per ragazzi", 1997, 320, "Bloomsbury Publishing", "Italiano", "978-8869186641", 100, 12.99));
        libroRepository.save(new Libro("Sapiens: Da animali a dèi", "Yuval Noah Harari", "Saggistica storica", 2011, 544, "Bompiani", "Italiano", "978-8845296833", 40, 18.90));
        libroRepository.save(new Libro("Va' dove ti porta il cuore", "Susanna Tamaro", "Romanzo", 1994, 192, "Baldini & Castoldi", "Italiano", "978-8884901962", 60, 10.00));
        libroRepository.save(new Libro("I Promessi Sposi", "Alessandro Manzoni", "Romanzo storico", 1840, 700, "Ferrara", "Italiano", "978-8809766940", 25, 14.50));
        libroRepository.save(new Libro("Introduzione alla Programmazione in Java", "Herbert Schildt", "Informatica", 2019, 1000, "McGraw-Hill Education", "Italiano", "978-0078022171", 15, 45.00));
        libroRepository.save(new Libro("La Cucina Italiana: Il Ricettario Completo", "AA.VV.", "Cucina", 2010, 600, "Editoriale Domus", "Italiano", "978-8872126285", 20, 30.00));
        libroRepository.save(new Libro("L'Alienista", "Caleb Carr", "Thriller psicologico", 1994, 480, "Rizzoli", "Italiano", "978-8817024469", 35, 16.25));

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
