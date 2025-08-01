package me.leoo.springboot.libri.libri;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import me.leoo.springboot.libri.libri.descrizione.LibroInfo;
import me.leoo.springboot.libri.libri.images.ImageUtils;
import me.leoo.springboot.libri.rifornimento.Rifornimento;
import org.springframework.http.ResponseEntity;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Date;
import java.util.List;

@Slf4j
@Getter
@Setter
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Libro {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String titolo;
    private String autore;
    private String genere;
    private int annoPubblicazione;
    private int numeroPagine;
    private String editore;
    private String lingua;
    private String isbn;

    private Date dataAggiunta = new Date();

    @ElementCollection(fetch = FetchType.EAGER)
    private List<Long> recensioni = List.of();

    @OneToOne(cascade = CascadeType.PERSIST, optional = false)
    private Rifornimento rifornimento;

    @OneToOne(mappedBy = "libro", cascade = CascadeType.ALL, orphanRemoval = true)
    private LibroInfo descrizione;


    public static final String IMAGE_DIR = "src/main/resources/static/images";

    public Libro(String titolo, String autore, String genere, int annoPubblicazione, int numeroPagine, String editore, String lingua, String isbn, int quantita, double prezzo) {
        this.titolo = titolo;
        this.autore = autore;
        this.genere = genere;
        this.annoPubblicazione = annoPubblicazione;
        this.numeroPagine = numeroPagine;
        this.editore = editore;
        this.lingua = lingua;
        this.isbn = isbn;

        this.descrizione = new LibroInfo(this, """
                Un libro scritto per raccontare una storia, condividere conoscenza o semplicemente per intrattenere.
                <br><br>
                
                Lo scopo di un libro è quello di trasmettere idee, emozioni e informazioni attraverso le parole scritte.
                Quindi, un libro può essere un romanzo, un saggio, una biografia o qualsiasi altra forma di narrazione scritta.
                
                """, "Autore molto conosciuto nel ambito della letteratura");

        this.rifornimento = new Rifornimento(quantita, prezzo);
    }


    public Libro updateFrom(Libro libro) {
        this.titolo = libro.getTitolo();
        this.autore = libro.getAutore();
        this.genere = libro.getGenere();
        this.annoPubblicazione = libro.getAnnoPubblicazione();
        this.numeroPagine = libro.getNumeroPagine();
        this.editore = libro.getEditore();
        this.lingua = libro.getLingua();
        this.isbn = libro.getIsbn();

        return this;
    }

    public LibroController.LiteBookResponse toLiteBookResponse() {
        return new LibroController.LiteBookResponse(
                this.id,
                this.titolo,
                this.autore,
                this.annoPubblicazione,
                this.rifornimento.getPrezzoTotale(),
                this.rifornimento.getSconto()
        );
    }

    @JsonIgnore
    public boolean isInStock() {
        return rifornimento != null && rifornimento.getDisponibili() > 0;
    }

    @JsonIgnore
    public boolean isInOfferta() {
        return rifornimento != null && rifornimento.getSconto() != null;
    }

    public ResponseEntity<byte[]> getPictureResponse(int index) {
        List<Path> paths = getAllImages();

        if(index < 0 || index >= paths.size()) {
            return ResponseEntity.notFound().build();
        }

        Path path = paths.get(index);

        try {
            return ImageUtils.getImageResponse(path);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    public List<Path> getAllImages() {
        try {
            String finalPath = IMAGE_DIR + "/" + id;
            Path dirPath = Paths.get(finalPath);

            if (!Files.exists(dirPath) || !Files.isDirectory(dirPath)) {
                return List.of();
            }

            return Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .toList();
        } catch (Exception e ) {
            throw new RuntimeException("Error while getting all images for book with ID: " + id, e);
        }
    }
}