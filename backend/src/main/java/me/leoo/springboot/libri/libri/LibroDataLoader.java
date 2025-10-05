package me.leoo.springboot.libri.libri;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.libri.autore.Autore;
import me.leoo.springboot.libri.libri.autore.AutoreService;
import me.leoo.springboot.libri.libri.category.Category;
import me.leoo.springboot.libri.libri.category.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

@Component
@Order(1) // Esegue prima degli altri DataLoader
@RequiredArgsConstructor
public class LibroDataLoader implements CommandLineRunner {

    private final LibroRepository libroRepository;
    private final AutoreService autoreService;
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (libroRepository.count() > 50) {
            System.out.println("Un numero sufficiente di libri è già presente nel database, salto il caricamento.");
            return;
        }

        System.out.println("Caricamento libri e autori nel database...");

        // Crea gli autori prima di creare i libri
        Autore tolkien = autoreService.getOrCreate("J.R.R. Tolkien", "Scrittore britannico, autore del Signore degli Anelli e Lo Hobbit");
        Autore herbert = autoreService.getOrCreate("Frank Herbert", "Scrittore americano di fantascienza, famoso per la saga di Dune");
        Autore brown = autoreService.getOrCreate("Dan Brown", "Scrittore americano famoso per i suoi thriller che mescolano storia, arte e religione");
        Autore rowling = autoreService.getOrCreate("J.K. Rowling", "Scrittrice britannica, creatrice della saga di Harry Potter");
        Autore harari = autoreService.getOrCreate("Yuval Noah Harari", "Storico e saggista israeliano, professore universitario e autore di bestseller");
        Autore tamaro = autoreService.getOrCreate("Susanna Tamaro", "Scrittrice italiana, famosa per i suoi romanzi emotivi e introspettivi");
        Autore manzoni = autoreService.getOrCreate("Alessandro Manzoni", "Scrittore e poeta italiano del XIX secolo, autore de I Promessi Sposi");
        Autore schildt = autoreService.getOrCreate("Herbert Schildt", "Programmatore e autore americano, esperto di linguaggi di programmazione");
        Autore autoriVari = autoreService.getOrCreate("AA.VV.", "Autori Vari - Raccolta di ricette della tradizione culinaria italiana");
        Autore carr = autoreService.getOrCreate("Caleb Carr", "Scrittore americano specializzato in thriller storici e psicologici");
        List<Autore> autori = Arrays.asList(tolkien, herbert, brown, rowling, harari, tamaro, manzoni, schildt, autoriVari, carr);


        Category libriCategory = new Category("Libri", "Categoria principale per tutti i libri");
        Category elettronicaCategory = new Category("Elettronica", "Categoria principale per tutti i prodotti elettronici");
        Category abbigliamentoCategory = new Category("Abbigliamento", "Categoria principale per tutti i vestiti e accessori");
        Category casaCategory = new Category("Casa", "Categoria principale per tutti i prodotti per la casa");

        // Sottocategorie di Libri
        Category fantasyCategory = new Category("Fantasy", "Sottocategoria di libri fantasy", libriCategory);
        Category horrorCategory = new Category("Horror", "Sottocategoria di libri horror", libriCategory);
        Category thrillerCategory = new Category("Thriller", "Sottocategoria di libri thriller e suspense", libriCategory);

        // Sottocategorie di Elettronica
        Category hardwareCategory = new Category("Hardware", "Componenti hardware per computer e dispositivi elettronici", elettronicaCategory);
        Category softwareCategory = new Category("Software", "Programmi e applicazioni per dispositivi elettronici", elettronicaCategory);

        Category ramCategory = new Category("RAM", "Memorie ad accesso casuale per computer", hardwareCategory);
        Category cpuCategory = new Category("CPU", "Processori centrali per computer", hardwareCategory);
        Category gpuCategory = new Category("GPU", "Schede grafiche per computer", hardwareCategory);
        Category monitorCategory = new Category("Monitor", "Schermi e monitor per computer", hardwareCategory);

        Category productivitySoftwareCategory = new Category("Software di produttività", "Software per aumentare la produttività personale e aziendale", softwareCategory);
        Category antivirusSoftwareCategory = new Category("Software antivirus", "Programmi per la protezione da virus e malware", softwareCategory);

        // Sottocategorie di Abbigliamento
        Category uomoCategory = new Category("Uomo", "Abbigliamento e accessori per uomo", abbigliamentoCategory);
        Category donnaCategory = new Category("Donna", "Abbigliamento e accessori per donna", abbigliamentoCategory);

        Category traditionalCategory = new Category("Traditional", "Abbigliamento tradizionale e classico", abbigliamentoCategory);
        Category casualCategory = new Category("Casual", "Abbigliamento casual per tutti i giorni", abbigliamentoCategory);
        Category sportCategory = new Category("Sport", "Abbigliamento e accessori sportivi", abbigliamentoCategory);

        // Sottocategorie di Casa
        Category arredamentoCategory = new Category("Arredamento", "Mobili e soluzioni d'arredo per la casa", casaCategory);
        Category elettrodomesticiCategory = new Category("Elettrodomestici", "Apparecchi elettrici per la casa", casaCategory);
        Category decorazioniCategory = new Category("Decorazioni", "Oggetti decorativi per la casa", casaCategory);

        // Salva tutte le categorie nel database
        categoryRepository.saveAll(List.of(
                libriCategory,
                elettronicaCategory,
                abbigliamentoCategory,
                casaCategory,
                fantasyCategory,
                horrorCategory,
                thrillerCategory,
                hardwareCategory,
                softwareCategory,
                ramCategory,
                cpuCategory,
                gpuCategory,
                monitorCategory,
                productivitySoftwareCategory,
                antivirusSoftwareCategory,
                uomoCategory,
                donnaCategory,
                traditionalCategory,
                casualCategory,
                sportCategory,
                arredamentoCategory,
                elettrodomesticiCategory,
                decorazioniCategory
        ));

        List<Category> categories = Arrays.asList(
                fantasyCategory, horrorCategory, thrillerCategory,
                ramCategory, cpuCategory, gpuCategory, monitorCategory,
                productivitySoftwareCategory, antivirusSoftwareCategory,
                uomoCategory, donnaCategory, traditionalCategory, casualCategory, sportCategory,
                arredamentoCategory, elettrodomesticiCategory, decorazioniCategory
        );

        /*
        // Crea i libri utilizzando il costruttore con oggetti Autore
        libroRepository.save(new Libro(fantasyCategory, "Il Signore degli Anelli", tolkien, "Fantasy", 1954, 1200, "George Allen & Unwin", "Italiano", "9788845292613", 50, 25.00));
        libroRepository.save(new Libro(fantasyCategory, "Dune", herbert, "Fantascienza", 1965, 800, "Chilton Books", "Italiano", "9788834710186", 30, 20.50));
        libroRepository.save(new Libro(thrillerCategory, "Il Codice Da Vinci", brown, "Thriller", 2003, 592, "Doubleday", "Italiano", "9788804519962", 75, 15.75));
        libroRepository.save(new Libro(fantasyCategory, "Harry Potter e la Pietra Filosofale", rowling, "Fantasy per ragazzi", 1997, 320, "Bloomsbury Publishing", "Italiano", "9788869186641", 100, 12.99));
        libroRepository.save(new Libro(libriCategory, "Sapiens: Da animali a dèi", harari, "Saggistica storica", 2011, 544, "Bompiani", "Italiano", "9788845296833", 40, 18.90));
        libroRepository.save(new Libro(libriCategory, "Va' dove ti porta il cuore", tamaro, "Romanzo", 1994, 192, "Baldini & Castoldi", "Italiano", "9788884901962", 60, 10.00));
        libroRepository.save(new Libro(libriCategory, "I Promessi Sposi", manzoni, "Romanzo storico", 1840, 700, "Ferrara", "Italiano", "9788809766940", 25, 14.50));
        libroRepository.save(new Libro(libriCategory, "Introduzione alla Programmazione in Java", schildt, "Informatica", 2019, 1000, "McGraw-Hill Education", "Italiano", "9780078022171", 15, 45.00));
        libroRepository.save(new Libro(libriCategory, "La Cucina Italiana: Il Ricettario Completo", autoriVari, "Cucina", 2010, 600, "Editoriale Domus", "Italiano", "9788872126285", 20, 30.00));
        libroRepository.save(new Libro(thrillerCategory, "L'Alienista", carr, "Thriller psicologico", 1994, 480, "Rizzoli", "Italiano", "9788817024469", 35, 16.25));
        */

        List<Libro> libriDaSalvare = new ArrayList<>();
        libriDaSalvare.add(new Libro(fantasyCategory, "Il Signore degli Anelli", tolkien, "Fantasy", 1954, 1200, "George Allen & Unwin", "Italiano", "9788845292613", 50, 25.00));
        libriDaSalvare.add(new Libro(fantasyCategory, "Dune", herbert, "Fantascienza", 1965, 800, "Chilton Books", "Italiano", "9788834710186", 30, 20.50));
        libriDaSalvare.add(new Libro(thrillerCategory, "Il Codice Da Vinci", brown, "Thriller", 2003, 592, "Doubleday", "Italiano", "9788804519962", 75, 15.75));
        libriDaSalvare.add(new Libro(fantasyCategory, "Harry Potter e la Pietra Filosofale", rowling, "Fantasy per ragazzi", 1997, 320, "Bloomsbury Publishing", "Italiano", "9788869186641", 100, 12.99));
        libriDaSalvare.add(new Libro(libriCategory, "Sapiens: Da animali a dèi", harari, "Saggistica storica", 2011, 544, "Bompiani", "Italiano", "9788845296833", 40, 18.90));
        libriDaSalvare.add(new Libro(libriCategory, "Va' dove ti porta il cuore", tamaro, "Romanzo", 1994, 192, "Baldini & Castoldi", "Italiano", "9788884901962", 60, 10.00));
        libriDaSalvare.add(new Libro(libriCategory, "I Promessi Sposi", manzoni, "Romanzo storico", 1840, 700, "Ferrara", "Italiano", "9788809766940", 25, 14.50));
        libriDaSalvare.add(new Libro(libriCategory, "Introduzione alla Programmazione in Java", schildt, "Informatica", 2019, 1000, "McGraw-Hill Education", "Italiano", "9780078022171", 15, 45.00));
        libriDaSalvare.add(new Libro(libriCategory, "La Cucina Italiana: Il Ricettario Completo", autoriVari, "Cucina", 2010, 600, "Editoriale Domus", "Italiano", "9788872126285", 20, 30.00));
        libriDaSalvare.add(new Libro(thrillerCategory, "L'Alienista", carr, "Thriller psicologico", 1994, 480, "Rizzoli", "Italiano", "9788817024469", 35, 16.25));

        Random random = new Random();
        for (int i = 0; i < 50; i++) {
            Category category = categories.get(random.nextInt(categories.size()));
            Autore autore = autori.get(random.nextInt(autori.size()));
            String titolo = "Libro Generato " + (i + 1);
            String genere = "Genere " + random.nextInt(10);
            int anno = 1900 + random.nextInt(124);
            int pagine = 100 + random.nextInt(900);
            String editore = "Editore " + random.nextInt(20);
            String lingua = "Italiano";
            String isbn = "978-88-" + (10000000 + random.nextInt(90000000));
            int stock = random.nextInt(100);
            double prezzo = Math.round((10 + (40 * random.nextDouble())) * 100.0) / 100.0;

            libriDaSalvare.add(new Libro(category, titolo, autore, genere, anno, pagine, editore, lingua, isbn, stock, prezzo));
        }
        libroRepository.saveAll(libriDaSalvare);

        System.out.println("Libri e autori caricati nel database: " + libroRepository.count() + " libri");
    }
}
