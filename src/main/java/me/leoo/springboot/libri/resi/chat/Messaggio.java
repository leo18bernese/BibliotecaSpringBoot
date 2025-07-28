package me.leoo.springboot.libri.resi.chat;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.libri.images.ImageUtils;
import me.leoo.springboot.libri.resi.Reso;
import org.springframework.http.ResponseEntity;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "reso_chat_messaggi")
public class Messaggio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reso_id", nullable = false)
    @JsonIgnore
    private Reso reso;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String testo;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "reso_chat_allegati", joinColumns = @JoinColumn(name = "messaggio_id"))
    @Column(name = "allegato_path")
    private Set<String> allegati = new HashSet<>();

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMittente mittente;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }


    private static final String UPLOAD_DIR = "src/main/resources/static/images/ordini";


    public Messaggio(Reso reso, String testo, TipoMittente mittente) {
        this.reso = reso;
        this.testo = testo;
        this.mittente = mittente;
        this.timestamp = LocalDateTime.now();
    }

    /**
     * Structure: order dir -> attachment_messageId_index.extension <br/>
     * <p>
     * attachment_4_1.jpg for for the first attachment of the fourth message
     */
    public List<Path> getAllImages() {
        try {
            String finalPath = UPLOAD_DIR + "/" + reso.getId();
            Path dirPath = Paths.get(finalPath);

            System.out.println("Looking for images in directory: " + finalPath + " for message ID: " + id);

            if (!Files.exists(dirPath) || !Files.isDirectory(dirPath)) {
                return List.of();
            }

            System.out.println("Directory exists and is valid: " + finalPath);

            return Files.list(dirPath)
                    .filter(Files::isRegularFile)
                    .filter(path -> path.getFileName().toString().startsWith("attachment_" + id + "_"))
                    .toList();

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error while getting all images for book with ID: " + id, e);
        }
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
}