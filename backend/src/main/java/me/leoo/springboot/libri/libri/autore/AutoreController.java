package me.leoo.springboot.libri.libri.autore;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/autori")
public class AutoreController {

    @Autowired
    private AutoreRepository autoreRepository;

    @Autowired
    private AutoreService autoreService;

    // DTO per le richieste di creazione/modifica
    public record AutoreRequest(String nome, String descrizione) {}

    // DTO per le risposte
    public record AutoreResponse(Long id, String nome, String descrizione) {

        public static AutoreResponse from(Autore autore) {
            return new AutoreResponse(autore.getId(), autore.getNome(), autore.getDescrizione());
        }
    }

    // Ottieni tutti gli autori
    @GetMapping
    public List<AutoreResponse> getAllAutori() {
        log.info("Richiesta per ottenere tutti gli autori");
        return autoreRepository.findAll()
                .stream()
                .map(AutoreResponse::from)
                .toList();
    }

    // Ottieni autore per ID
    @GetMapping("/{id}")
    public ResponseEntity<AutoreResponse> getAutoreById(@PathVariable Long id) {
        log.info("Richiesta per ottenere autore con ID: {}", id);

        Optional<Autore> autoreOptional = autoreRepository.findById(id);
        if (autoreOptional.isEmpty()) {
            log.warn("Autore con ID {} non trovato", id);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(AutoreResponse.from(autoreOptional.get()));
    }

    // Cerca autori per nome (ricerca parziale)
    @GetMapping("/search")
    public List<AutoreResponse> searchAutori(@RequestParam String nome) {
        log.info("Ricerca autori con nome contenente: {}", nome);
        return autoreRepository.findByNomeContainingIgnoreCase(nome)
                .stream()
                .map(AutoreResponse::from)
                .toList();
    }

    // Ottieni autore per nome esatto
    @GetMapping("/nome/{nome}")
    public ResponseEntity<AutoreResponse> getAutoreByNome(@PathVariable String nome) {
        log.info("Richiesta per ottenere autore con nome: {}", nome);

        Optional<Autore> autoreOptional = autoreRepository.findByNome(nome);
        if (autoreOptional.isEmpty()) {
            log.warn("Autore con nome '{}' non trovato", nome);
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(AutoreResponse.from(autoreOptional.get()));
    }

    // Crea nuovo autore
    @PostMapping
    public ResponseEntity<AutoreResponse> createAutore(@RequestBody AutoreRequest request) {
        log.info("Richiesta per creare nuovo autore: {}", request.nome());

        // Validazione input
        if (request.nome() == null || request.nome().isBlank()) {
            log.warn("Tentativo di creare autore senza nome");
            return ResponseEntity.badRequest().build();
        }

        // Controlla se esiste già un autore con questo nome
        if (autoreRepository.findByNome(request.nome()).isPresent()) {
            log.warn("Tentativo di creare autore duplicato: {}", request.nome());
            return ResponseEntity.badRequest().build();
        }

        Autore nuovoAutore = new Autore(request.nome(), request.descrizione());
        Autore autoreSalvato = autoreRepository.save(nuovoAutore);

        log.info("Autore creato con successo: ID {}, Nome '{}'", autoreSalvato.getId(), autoreSalvato.getNome());
        return ResponseEntity.ok(AutoreResponse.from(autoreSalvato));
    }

    // Modifica autore esistente
    @PutMapping("/{id}")
    public ResponseEntity<AutoreResponse> updateAutore(@PathVariable Long id, @RequestBody AutoreRequest request) {
        log.info("Richiesta per modificare autore con ID: {}", id);

        Optional<Autore> autoreOptional = autoreRepository.findById(id);
        if (autoreOptional.isEmpty()) {
            log.warn("Tentativo di modificare autore inesistente con ID: {}", id);
            return ResponseEntity.notFound().build();
        }

        // Validazione input
        if (request.nome() == null || request.nome().isBlank()) {
            log.warn("Tentativo di modificare autore {} senza nome", id);
            return ResponseEntity.badRequest().build();
        }

        Autore autore = autoreOptional.get();

        // Controlla se il nuovo nome è già usato da un altro autore
        Optional<Autore> autoreConStessoNome = autoreRepository.findByNome(request.nome());
        if (autoreConStessoNome.isPresent() && !autoreConStessoNome.get().getId().equals(id)) {
            log.warn("Tentativo di modificare autore {} con nome già esistente: {}", id, request.nome());
            return ResponseEntity.badRequest().build();
        }

        // Aggiorna i campi
        autore.setNome(request.nome());
        autore.setDescrizione(request.descrizione());

        Autore autoreSalvato = autoreRepository.save(autore);

        log.info("Autore modificato con successo: ID {}, Nome '{}'", autoreSalvato.getId(), autoreSalvato.getNome());
        return ResponseEntity.ok(AutoreResponse.from(autoreSalvato));
    }

    // Cancella autore
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAutore(@PathVariable Long id) {
        log.info("Richiesta per cancellare autore con ID: {}", id);

        if (!autoreRepository.existsById(id)) {
            log.warn("Tentativo di cancellare autore inesistente con ID: {}", id);
            return ResponseEntity.notFound().build();
        }

        autoreRepository.deleteById(id);
        log.info("Autore con ID {} cancellato con successo", id);
        return ResponseEntity.noContent().build();
    }

    // Ottieni o crea autore (endpoint che usa il servizio)
    @PostMapping("/get-or-create")
    public ResponseEntity<AutoreResponse> getOrCreateAutore(@RequestBody AutoreRequest request) {
        log.info("Richiesta getOrCreate per autore: {}", request.nome());

        if (request.nome() == null || request.nome().isBlank()) {
            log.warn("Tentativo di getOrCreate autore senza nome");
            return ResponseEntity.badRequest().build();
        }

        Autore autore = autoreService.getOrCreate(request.nome(), request.descrizione());

        if (autore == null) {
            log.error("Errore nel getOrCreate per autore: {}", request.nome());
            return ResponseEntity.internalServerError().build();
        }

        log.info("GetOrCreate completato per autore: ID {}, Nome '{}'", autore.getId(), autore.getNome());
        return ResponseEntity.ok(AutoreResponse.from(autore));
    }
}
