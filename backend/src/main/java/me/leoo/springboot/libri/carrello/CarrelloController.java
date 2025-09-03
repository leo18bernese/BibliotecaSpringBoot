package me.leoo.springboot.libri.carrello;

import jakarta.transaction.NotSupportedException;
import me.leoo.springboot.libri.buono.BuonoService;
import me.leoo.springboot.libri.carrello.item.CarrelloItem;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.libri.LibroRepository;
import me.leoo.springboot.libri.libri.autore.Autore;
import me.leoo.springboot.libri.libri.variante.Variante;
import me.leoo.springboot.libri.ordini.Ordine;
import me.leoo.springboot.libri.ordini.OrdineRepository;
import me.leoo.springboot.libri.ordini.OrdineService;
import me.leoo.springboot.libri.rifornimento.Rifornimento;
import me.leoo.springboot.libri.spedizione.SpedizioneIndirizzo;
import me.leoo.springboot.libri.spedizione.SpedizioneLuogo;
import me.leoo.springboot.libri.utente.Utente;
import me.leoo.springboot.libri.utente.UtenteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;
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

    @Autowired
    private OrdineRepository ordineRepository;
    @Autowired
    private OrdineService ordineService;

    // DTO per le risposte
    public record CarrelloItemResponse(Long libroId, String titolo, Autore autore, int annoPubblicazione, int quantita,
                                       Date dataAggiunta, double prezzo, double prezzoAggiunta,
                                       Rifornimento rifornimento, String varianteNome) {
    }

    public record CouponResponse(String codice, double percentuale, double valore) {
    }

    public record CarrelloResponse(Set<CarrelloItemResponse> items, double totale, double finale, int numeroItems,
                                   Set<CouponResponse> couponCodes, boolean canCheckout) {
    }

    public record ItemRequest(Long libroId, Long varianteId, int quantita) {
    }

    public record InviaOrdineRequest(String luogoSpedizione, String corriereId, String tipoSpedizioneId,
                                     SpedizioneIndirizzo indirizzoSpedizione, double speseSpedizione,
                                     String metodoPagamento) {
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
                            item.getVariante().getPrezzo().getPrezzoTotale(),
                            item.getPrezzoAggiunta(),
                            item.getVariante().getRifornimento(),
                            item.getVariante().getNome()
                    );
                })
                .collect(Collectors.toSet());

        try {
            carrello.checkCoupons();
        } catch (Exception e) {
            Logger.getGlobal().log(Level.SEVERE, e.getMessage());
            throw e;
        }

        Set<CouponResponse> couponResponses = carrello.getCouponCodes().stream()
                .filter(coupon -> coupon.getSconto() != null)
                .map(coupon -> new CouponResponse(
                        coupon.getCodice(),
                        coupon.getSconto().getPercentuale(),
                        coupon.getSconto().getValore()
                ))
                .collect(Collectors.toSet());

        return new CarrelloResponse(responseItems, carrello.getSommaPrezzi(), carrello.getPrezzoFinale(), responseItems.size(), couponResponses, carrello.canCheckout());
    }

    @GetMapping
    public ResponseEntity<?> getCarrello(@AuthenticationPrincipal Utente utente) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        try {
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            return ResponseEntity.ok(mapToCarrelloResponse(carrello));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/items")
    public ResponseEntity<?> getCarrelloItems(@AuthenticationPrincipal Utente utente) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
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

            int sum = carrello.getItems().stream()
                    .mapToInt(CarrelloItem::getQuantita)
                    .sum();

            return ResponseEntity.ok(sum);
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
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }
        try {
            System.out.println("request: " + request.libroId() + " variante: " + request.varianteId() + " quantita: " + request.quantita());
            Carrello carrello = carrelloService.addItemToCarrello(utente, request.libroId(), request.varianteId(), request.quantita());
            return ResponseEntity.ok(mapToCarrelloResponse(carrello));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nell'aggiunta del libro al carrello: " + e.getMessage());
        }
    }

    @PutMapping("/set-quantity/{utenteId}")
    public ResponseEntity<?> setLibroQuantity(@AuthenticationPrincipal Utente utente,
                                              @RequestBody ItemRequest request,
                                              @PathVariable Long utenteId) {
        if (utente == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Utente non autenticato");
        }

        if (!utente.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            Utente targetUtente = utenteRepository.findById(utenteId)
                    .orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + utenteId));

            Carrello carrello = carrelloService.setItemQuantity(targetUtente, request.libroId(), request.varianteId(), request.quantita());
            return ResponseEntity.ok(mapToCarrelloResponse(carrello));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nell'impostazione della quantità del libro nel carrello: " + e.getMessage());
        }
    }


    @DeleteMapping("/items")
    public ResponseEntity<?> removeLibro(@AuthenticationPrincipal Utente utente,
                                         @RequestBody ItemRequest request) {
        try {
            Carrello carrello = carrelloService.removeItemFromCarrello(utente, request.libroId(), request.varianteId(), request.quantita());
            return ResponseEntity.ok(mapToCarrelloResponse(carrello));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nella rimozione del libro dal carrello: " + e.getMessage());
        }
    }

    @GetMapping("/items/{libroId}")
    public ResponseEntity<?> getLibro(@AuthenticationPrincipal Utente utente, @PathVariable Long libroId) {
        try {
            System.out.println("Fetching item for libroId: " + libroId + " and user: " + utente.getUsername());
            CarrelloItem item = carrelloService.getCarrelloItem(utente, libroId);
            Libro libro = item.getLibro();

            System.out.println("Found item: " + item + " for libro: " + libro.getTitolo());

            CarrelloItemResponse response = new CarrelloItemResponse(
                    libro.getId(),
                    libro.getTitolo(),
                    libro.getAutore(),
                    libro.getAnnoPubblicazione(),
                    item.getQuantita(),
                    item.getUltimaModifica(),
                    item.getVariante().getPrezzo().getPrezzoTotale(),
                    item.getPrezzoAggiunta(),
                    item.getVariante().getRifornimento(),
                    item.getVariante().getNome()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/items/{libroId}/{varianteId}")
    public ResponseEntity<?> getLibroVariante(@AuthenticationPrincipal Utente utente, @PathVariable Long libroId, @PathVariable Long varianteId) {
        try {
            CarrelloItem item = carrelloService.getCarrelloItemByVariante(utente,varianteId);
            Libro libro = item.getLibro();

            CarrelloItemResponse response = new CarrelloItemResponse(
                    libro.getId(),
                    libro.getTitolo(),
                    libro.getAutore(),
                    libro.getAnnoPubblicazione(),
                    item.getQuantita(),
                    item.getUltimaModifica(),
                    item.getVariante().getPrezzo().getPrezzoTotale(),
                    item.getPrezzoAggiunta(),
                    item.getVariante().getRifornimento(),
                    item.getVariante().getNome()
            );

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/fix-quantity/{libroId}/{varianteId}")
    public ResponseEntity<?> fixQuantity(@AuthenticationPrincipal Utente utente, @PathVariable Long libroId, @PathVariable Long varianteId) {
        try {
            Utente user = utenteRepository.findById(utente.getId())
                    .orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + utente.getId()));

            Libro libro = libroRepository.findById(libroId)
                    .orElseThrow(() -> new RuntimeException("Libro non trovato con ID: " + libroId));

            Carrello carrello = carrelloService.getCarrelloByUtente(user);

            CarrelloItem item = carrello.getItemByVariante(varianteId);
            if (item == null) {
                return ResponseEntity.badRequest().body("Il libro non è presente nel carrello.");
            }

            item.fixQuantity();
            carrelloRepository.save(carrello);

            return ResponseEntity.ok("Quantità aggiornata se necessario.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nell'aggiornamento della quantità: " + e.getMessage());
        }
    }

    @PutMapping("/confirm-notices/{libroId}/{varianteId}")
    public ResponseEntity<?> confirmNotices(@AuthenticationPrincipal Utente utente, @PathVariable Long libroId ,@PathVariable Long varianteId) {
        try {
            Utente user = utenteRepository.findById(utente.getId())
                    .orElseThrow(() -> new RuntimeException("Utente non trovato con ID: " + utente.getId()));

            Libro libro = libroRepository.findById(libroId)
                    .orElseThrow(() -> new RuntimeException("Libro non trovato con ID: " + libroId));

            Carrello carrello = carrelloService.getCarrelloByUtente(user);

            CarrelloItem item = carrello.getItemByVariante(varianteId);
            if (item == null) {
                return ResponseEntity.badRequest().body("Il libro non è presente nel carrello.");
            }

            item.confirmNotices();
            carrelloRepository.save(carrello);

            return ResponseEntity.ok("Notifica confermata e rimossa.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nella conferma della notifica: " + e.getMessage());
        }
    }

    //ordine
    @PostMapping("/invia")
    public ResponseEntity<?> inviaOrdine(@AuthenticationPrincipal Utente utente,
                                         @RequestBody InviaOrdineRequest request) {
        try {
            Carrello carrello = carrelloService.getCarrelloByUtente(utente);
            if (carrello.getItems().isEmpty()) {
                return ResponseEntity.badRequest().body("Il carrello è vuoto");
            }

            SpedizioneLuogo spedizioneLuogo = SpedizioneLuogo.valueOf(request.luogoSpedizione().toUpperCase());

            Ordine ordine = new Ordine(carrello, spedizioneLuogo, request.corriereId(), request.tipoSpedizioneId(), request.indirizzoSpedizione(), request.speseSpedizione(), request.metodoPagamento());

            return ResponseEntity.ok(ordineService.inviaOrdine(ordine));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Errore nell'invio dell'ordine: " + e.getMessage());
        }
    }

}