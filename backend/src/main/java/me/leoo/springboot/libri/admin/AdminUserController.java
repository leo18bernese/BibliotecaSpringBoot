package me.leoo.springboot.libri.admin;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.carrello.CarrelloService;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import me.leoo.springboot.libri.utente.UtenteService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/user")
@RequiredArgsConstructor
public class AdminUserController {

    private final UtenteRepository utenteRepository;
    private final UtenteService utenteService;
    private final CarrelloService carrelloService;

    public record UserResponse(Long id, String name, String surname, String email,
                               Set<String> roles, int cartItems, int wishlistItems,
                               int addresses) {

    }

    public record DetailedUserResponse(Long id, String name, String email,
                                       Set<String> roles,
                                       Set<AddressResponse> addresses,
                                       Set<CartItemResponse> cartItems,
                                       Set<WishlistItemResponse> wishlistItems) {
    }

    public record AddressResponse(Long id, String indirizzo, String citta,
                                  String cap, String provincia) {
    }

    public record CartItemResponse(Long bookId, String bookTitle, int quantity) {
    }

    public record WishlistItemResponse(Long id, String title) {
    }


    @GetMapping("/light-all")
    public ResponseEntity<Page<UserResponse>> getAllLightUsers(@RequestParam(defaultValue = "0") int page,
                                                               @RequestParam(defaultValue = "20") int size) {

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Utente> utenti = utenteRepository.findAll(pageable);

            Page<UserResponse> userResponses = utenti.map(l -> {
                Carrello carrello = carrelloService.getCarrelloByUtente(l);
                return new UserResponse(
                        l.getId(),
                        l.getNome(),
                        l.getCognome(),
                        l.getEmail(),
                        l.getRuoli(),
                        carrello.getItems().size(),
                        l.getWishlist() != null ? l.getWishlist().size() : 0,
                        l.getIndirizzi() != null ? l.getIndirizzi().size() : 0
                );
            });

            return ResponseEntity.ok(userResponses);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public DetailedUserResponse getUserById(@PathVariable Long id) {
        Utente l = utenteService.getUtenteById(id);

        Carrello carrello = carrelloService.getCarrelloByUtente(l);

        Set<AddressResponse> addresses = l.getIndirizzi() != null ? l.getIndirizzi().stream()
                .map(a -> new AddressResponse(
                        a.getId(),
                        a.getIndirizzo(),
                        a.getCitta(),
                        a.getCap(),
                        a.getProvincia()
                )).collect(Collectors.toSet()) : Set.of();

        Set<CartItemResponse> cartItems = carrello.getItems().stream()
                .map(i -> new CartItemResponse(
                        i.getLibro().getId(),
                        i.getLibro().getTitolo(),
                        i.getQuantita()
                )).collect(Collectors.toSet());

        Set<WishlistItemResponse> wishlistItems = l.getWishlist() != null ? l.getWishlist().stream()
                .map(w -> new WishlistItemResponse(
                        w.getId(),
                        w.getTitolo()
                )).collect(Collectors.toSet()) : Set.of();


        return new DetailedUserResponse(
                l.getId(),
                l.getUsername(),
                l.getEmail(),
                l.getRuoli(),
                addresses,
                cartItems,
                wishlistItems
        );
    }
}
