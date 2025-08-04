package me.leoo.springboot.libri.utente.wishlist;

import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.libri.autore.Autore;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private UtenteRepository utenteRepository;

    public record WishlistResponse(Long id, String titolo, Autore autore, String genere,
                                   int annoPubblicazione, int numeroPagine, String editore,
                                   String lingua, String isbn) {
    }

    @GetMapping("/has/{id}")
    public ResponseEntity<Boolean> hasWishlistItem(@AuthenticationPrincipal Utente user,
                                                   @PathVariable Long id) {
        if(user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            boolean hasWishlist = user.getWishlist().stream()
                    .anyMatch(libro -> libro.getId().equals(id));

            return ResponseEntity.ok(hasWishlist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}")
    public ResponseEntity<Void> addToWishlist(@AuthenticationPrincipal Utente user,
                                              @PathVariable Long id) {
        System.out.println("Adding to wishlist: " + id);

        try {
            Libro libro = libroRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Libro non trovato"));

            user.addToWishlist(libro);
            utenteRepository.save(user);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println("Error adding to wishlist: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeFromWishlist(@AuthenticationPrincipal Utente user,
                                                   @PathVariable Long id) {
        System.out.println("Removing from wishlist: " + id);

        try {
            user.removeFromWishlist(id);
            utenteRepository.save(user);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println("Error removing from wishlist: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }


    @GetMapping
    public ResponseEntity<WishlistResponse[]> getWishlist(@AuthenticationPrincipal Utente user) {

        try {
            WishlistResponse[] wishlist = user.getWishlist().stream()
                    .map(libro -> new WishlistResponse(
                            libro.getId(),
                            libro.getTitolo(),
                            libro.getAutore(),
                            libro.getGenere(),
                            libro.getAnnoPubblicazione(),
                            libro.getNumeroPagine(),
                            libro.getEditore(),
                            libro.getLingua(),
                            libro.getIsbn()))
                    .toArray(WishlistResponse[]::new);

            return ResponseEntity.ok(wishlist);
        } catch (Exception e) {
            System.out.println("Error retrieving wishlist: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
