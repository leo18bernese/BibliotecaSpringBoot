package me.leoo.springboot.libri.carrello;

import jakarta.transaction.NotSupportedException;
import me.leoo.springboot.libri.buono.BuonoService;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.rifornimento.Rifornimento;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/carrello")
public class CarrelloController {

    @Autowired
    private UtenteRepository utenteRepository;

    @Autowired
    private LibroRepository libroRepository;

    @Autowired
    private CarrelloRepository carrelloRepository;

    @Autowired
    private CarrelloService carrelloService;

    @Autowired
    private BuonoService buonoService;

    // DTO per le risposte
    public record CarrelloItemResponse(Long libroId, String titolo, String autore, int annoPubblicazione, int quantita,
                                       Date dataAggiunta, double prezzo, Rifornimento rifornimento) {
    }

    public record CouponResponse(String codice, double percentuale, double valore) {
    }

    public record CarrelloResponse(Set<CarrelloItemResponse> items, double totale,  double finale, int numeroItems,
                                   Set<CouponResponse> couponCodes) {
    }

    public record ItemRequest(Long libroId, int quantita) {
    }

    // Metodo helper per mappare l'entità Carrello al DTO CarrelloResponse
    private CarrelloResponse mapToCarrelloResponse(Carrello carrello) throws NotSupportedException {
        Set<CarrelloItemResponse> responseItems = carrello.getItems().stream()
                .map(item -> {
                    Libro libro = item.getLibro();

                    return new CarrelloItemResponse(
                            libro.getId(),
                            libro.getTitolo(),
                            libro.getAutore(),
                            libro.getAnnoPubblicazione(),
                            item.getQuantita(),
                            item.getAggiunta(),
                            libro.getRifornimento().getPrezzoTotale(),
                            libro.getRifornimento()
                    );
                })
                .collect(Collectors.toSet());

        System.out.println("dto carrello 1");
        try {
            carrello.checkCoupons();
        }catch (Exception e){
            System.out.println("Errore durante il controllo dei coupon: " + e.getMessage());
            throw e;
        }

        System.out.println("dto carrello 2");
        Set<CouponResponse> couponResponses = carrello.getCouponCodes().stream()
                .filter(coupon -> coupon.getSconto() != null)
                .map(coupon -> new CouponResponse(
                        coupon.getCodice(),
                        coupon.getSconto().getPercentuale(),
                        coupon.getSconto().getValore()
                ))
                .collect(Collectors.toSet());

        System.out.println("dto carrello 3");

        return new CarrelloResponse(responseItems, carrello.getSommaPrezzi(), carrello.getPrezzoFinale(), responseItems.size(),couponResponses);
    }

    @GetMapping
    public ResponseEntity<?> getCarrello(@AuthenticationPrincipal Utente utente) {
        if (utente == null) {
            return ResponseEntity.status(401).body("Utente non autenticato");
        }

        try {
            System.out.println("Recupero carrello per l'utente: " + utente.getUsername());
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            return ResponseEntity.ok(mapToCarrelloResponse(carrello));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/items")
    public ResponseEntity<?> getCarrelloItems(@AuthenticationPrincipal Utente utente) {
        if (utente == null) {
            return ResponseEntity.status(401).body("Utente non autenticato");
        }

        try {
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            return ResponseEntity.ok(mapToCarrelloResponse(carrello).items());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nel recupero degli item del carrello: " + e.getMessage());
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> getCarrelloAmount(@AuthenticationPrincipal Utente utente) {
        try {
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            return ResponseEntity.ok(carrello.getItems().size());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/total")
    public ResponseEntity<Double> getCarrelloTotal(@AuthenticationPrincipal Utente utente) {
        try {
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            return ResponseEntity.ok(carrello.getSommaPrezzi());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/items")
    public ResponseEntity<?> addLibro(@AuthenticationPrincipal Utente utente,
                                      @RequestBody ItemRequest request) {
        if (utente == null) {
            return ResponseEntity.status(401).body("Utente non autenticato");
        }
        try {
            Carrello carrello = carrelloService.addItemToCarrello(utente, request.libroId(), request.quantita());
            return ResponseEntity.ok(mapToCarrelloResponse(carrello));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nell'aggiunta del libro al carrello: " + e.getMessage());
        }
    }

    @DeleteMapping("/items")
    public ResponseEntity<?> removeLibro(@AuthenticationPrincipal Utente utente,
                                         @RequestBody ItemRequest request) {
        try {
            Carrello carrello = carrelloService.removeItemFromCarrello(utente, request.libroId(), request.quantita());
            return ResponseEntity.ok(mapToCarrelloResponse(carrello));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nella rimozione del libro dal carrello: " + e.getMessage());
        }
    }

    @GetMapping("/items/{libroId}")
    public ResponseEntity<?> getLibro(@AuthenticationPrincipal Utente utente, @PathVariable Long libroId) {
        try {
            CarrelloItem item = carrelloService.getCarrelloItem(utente, libroId);
            Libro libro = item.getLibro();

            CarrelloItemResponse response = new CarrelloItemResponse(
                    libro.getId(),
                    libro.getTitolo(),
                    libro.getAutore(),
                    libro.getAnnoPubblicazione(),
                    item.getQuantita(),
                    item.getUltimaModifica(),
                    libro.getRifornimento().getPrezzoTotale(),
                    libro.getRifornimento());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}