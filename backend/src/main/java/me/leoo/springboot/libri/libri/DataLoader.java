package me.leoo.springboot.libri.libri;

import me.leoo.springboot.libri.buono.Buono;
import me.leoo.springboot.libri.buono.BuonoRepository;
import me.leoo.springboot.libri.buono.StatoBuono;
import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.carrello.CarrelloRepository;
import me.leoo.springboot.libri.recensioni.Recensione;
import me.leoo.springboot.libri.recensioni.RecensioneRepository;
import me.leoo.springboot.libri.spedizione.SpedizioneIndirizzo;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import me.leoo.springboot.libri.utente.UtenteService;
import me.leoo.springboot.libri.utente.role.UserRole;
import me.leoo.springboot.libri.utils.Sconto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Component
@Order(2) // Esegue dopo LibroDataLoader
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

    @Autowired
    private BuonoRepository buonoRepository;

    @Override
    public void run(String... args) throws Exception {
        if (utenteRepository.findByUsername("Daniel18").isPresent()) {
            System.out.println("Dati utenti e buoni già caricati nel database, salto il caricamento");
            return;
        }

        System.out.println("Caricamento utenti, carrelli, recensioni e buoni nel database...");

        // Crea utente di test
        SpedizioneIndirizzo ind1 = new SpedizioneIndirizzo("Mario Rossi", "Via Roma 1", "Milano", "Milano", "20100", "1234567890");
        SpedizioneIndirizzo ind2 = new SpedizioneIndirizzo("Luigi Bianchi", "Via Milano 2", "Roma", "Roma", "00100", "0987654321");
        SpedizioneIndirizzo ind3 = new SpedizioneIndirizzo("Anna Verdi", "Via Napoli 3", "Grugliasco", "Torino", "10095", "1122334455");

        Utente u = new Utente("Daniel18", "ciao1234", "Daniel", "Bello", "daniel@gmail.com");
        u.addRuolo(UserRole.ADMIN);

        // Aggiungi un libro alla wishlist se esistono libri
        List<Libro> libri = libroRepository.findAll();
        if (!libri.isEmpty()) {
            u.addToWishlist(libri.get(0)); // Aggiungi il primo libro alla wishlist
        }

        u.addIndirizzo(ind1);
        u.addIndirizzo(ind2);
        u.addIndirizzo(ind3);
        Utente uu = utenteService.register(u);

        // Crea carrello per l'utente
        Carrello carrello = new Carrello(uu);
        carrelloRepository.save(carrello);

        // Crea recensioni per i libri esistenti
        for (Libro libro : libri) {
            for (int i = 0; i < 3; i++) {
                Recensione recensione = new Recensione(libro.getId(), uu.getId(), "Molto bello", "Ottimo libro, lo consiglio", 4, true, true);
                Recensione r = recensioneRepository.save(recensione);

                libro.getVarianteStandard().getRecensioni().add(r.getId());
            }
            libroRepository.save(libro);
        }

        // Crea buoni sconto
        // Buono sconto del 20% senza data di scadenza
        Buono buono1 = new Buono(
                "SCONTO20",
                new Sconto(20, 0),
                new Date(),
                null,
                0,
                5,
                50,
                false,
                null,
                StatoBuono.ATTIVO
        );
        buonoRepository.save(buono1);

        // Buono sconto fisso di 15€ con scadenza tra 30 giorni
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_MONTH, 30);
        Date scadenza = calendar.getTime();
        Buono buono2 = new Buono(
                "MENO15EURO",
                new Sconto(0, 15),
                new Date(),
                scadenza,
                0,
                1,
                100,
                false,
                uu,
                StatoBuono.ATTIVO
        );
        buonoRepository.save(buono2);

        // Buono sconto del 50% per un utente specifico
        Buono buono3 = new Buono(
                "VIP50",
                new Sconto(50, 0),
                new Date(),
                null,
                0,
                1,
                0,
                false,
                uu,
                StatoBuono.ATTIVO
        );
        buonoRepository.save(buono3);

        // Buono sconto di 5€ cumulabile con altri buoni
        Buono buono4 = new Buono(
                "EXTRA5",
                new Sconto(0, 5),
                new Date(),
                null,
                0,
                10,
                20,
                true,
                null,
                StatoBuono.ATTIVO
        );
        buonoRepository.save(buono4);

        // Buono sconto 30% non ancora attivo (futuro)
        Calendar futureStart = Calendar.getInstance();
        futureStart.add(Calendar.MONTH, 1);
        Calendar futureEnd = Calendar.getInstance();
        futureEnd.add(Calendar.MONTH, 2);
        Buono buono5 = new Buono(
                "ESTATE30",
                new Sconto(30, 0),
                futureStart.getTime(),
                futureEnd.getTime(),
                0,
                50,
                0,
                false,
                null,
                StatoBuono.ATTIVO
        );
        buonoRepository.save(buono5);

        System.out.println("Dati utenti e buoni caricati nel database");
    }
}
