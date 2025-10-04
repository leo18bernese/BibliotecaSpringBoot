package me.leoo.springboot.libri.libri;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.libri.autore.Autore;
import me.leoo.springboot.libri.libri.autore.AutoreService;
import me.leoo.springboot.libri.libri.category.Category;
import me.leoo.springboot.libri.libri.category.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(1) // Esegue prima degli altri DataLoader
@RequiredArgsConstructor
public class LibroDataLoader implements CommandLineRunner {

    private final LibroRepository libroRepository;
    private final AutoreService autoreService;
    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (libroRepository.existsById(1L)) {
            System.out.println("Libri già caricati nel database, salto il caricamento");
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

        Category libriCategory = new Category("Libri");
        Category elettronicaCategory = new Category("Elettronica");
        Category abbigliamentoCategory = new Category("Abbigliamento");
        Category casaCategory = new Category("Casa");

        // Sottocategorie di Libri
        Category fantasyCategory = new Category("Fantasy", libriCategory);
        Category horrorCategory = new Category("Horror", libriCategory);
        Category thrillerCategory = new Category("Thriller", libriCategory);

        // Sottocategorie di Elettronica
        Category hardwareCategory = new Category("Hardware", elettronicaCategory);
        Category softwareCategory = new Category("Software", elettronicaCategory);

        Category ramCategory = new Category("RAM", hardwareCategory);
        Category cpuCategory = new Category("CPU", hardwareCategory);
        Category gpuCategory = new Category("GPU", hardwareCategory);
        Category monitorCategory = new Category("Monitor", hardwareCategory);

        Category productivitySoftwareCategory = new Category("Software di produttività", softwareCategory);
        Category antivirusSoftwareCategory = new Category("Software antivirus", softwareCategory);

        // Sottocategorie di Abbigliamento
        Category uomoCategory = new Category("Uomo", abbigliamentoCategory);
        Category donnaCategory = new Category("Donna", abbigliamentoCategory);

        Category traditionalCategory = new Category("Traditional", abbigliamentoCategory);
        Category casualCategory = new Category("Casual", abbigliamentoCategory);
        Category sportCategory = new Category("Sport", abbigliamentoCategory);

        // Sottocategorie di Casa
        Category arredamentoCategory = new Category("Arredamento", casaCategory);
        Category elettrodomesticiCategory = new Category("Elettrodomestici", casaCategory);
        Category decorazioniCategory = new Category("Decorazioni", casaCategory);

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


        // Crea i libri utilizzando il costruttore con oggetti Autore
        libroRepository.save(new Libro(ramCategory, "Il Signore degli Anelli", tolkien, "Fantasy", 1954, 1200, "George Allen & Unwin", "Italiano", "9788845292613", 50, 25.00));
        libroRepository.save(new Libro(cpuCategory, "Dune", herbert, "Fantascienza", 1965, 800, "Chilton Books", "Italiano", "9788834710186", 30, 20.50));
        libroRepository.save(new Libro(antivirusSoftwareCategory, "Il Codice Da Vinci", brown, "Thriller", 2003, 592, "Doubleday", "Italiano", "9788804519962", 75, 15.75));
        libroRepository.save(new Libro(traditionalCategory, "Harry Potter e la Pietra Filosofale", rowling, "Fantasy per ragazzi", 1997, 320, "Bloomsbury Publishing", "Italiano", "9788869186641", 100, 12.99));
        libroRepository.save(new Libro(casualCategory, "Sapiens: Da animali a dèi", harari, "Saggistica storica", 2011, 544, "Bompiani", "Italiano", "9788845296833", 40, 18.90));
        libroRepository.save(new Libro(arredamentoCategory, "Va' dove ti porta il cuore", tamaro, "Romanzo", 1994, 192, "Baldini & Castoldi", "Italiano", "9788884901962", 60, 10.00));
        libroRepository.save(new Libro(elettrodomesticiCategory, "I Promessi Sposi", manzoni, "Romanzo storico", 1840, 700, "Ferrara", "Italiano", "9788809766940", 25, 14.50));
        libroRepository.save(new Libro(fantasyCategory, "Introduzione alla Programmazione in Java", schildt, "Informatica", 2019, 1000, "McGraw-Hill Education", "Italiano", "9780078022171", 15, 45.00));
        libroRepository.save(new Libro(horrorCategory, "La Cucina Italiana: Il Ricettario Completo", autoriVari, "Cucina", 2010, 600, "Editoriale Domus", "Italiano", "9788872126285", 20, 30.00));
        libroRepository.save(new Libro(uomoCategory, "L'Alienista", carr, "Thriller psicologico", 1994, 480, "Rizzoli", "Italiano", "9788817024469", 35, 16.25));

        System.out.println("Libri e autori caricati nel database: " + libroRepository.count() + " libri");
    }
}
