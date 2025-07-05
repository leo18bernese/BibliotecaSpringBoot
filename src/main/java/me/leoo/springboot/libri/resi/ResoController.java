package me.leoo.springboot.libri.resi;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.resi.chat.Messaggio;
import me.leoo.springboot.libri.resi.chat.TipoMittente;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/resi")
@RequiredArgsConstructor
public class ResoController {

    private final ResoService resoService;

    public record CreaResoRequest(
            Long ordineId,
            Set<CreaResoItemRequest> items
    ) {
    }

    public record CreaResoItemRequest(
            Long ordineItemId,
            MotivoReso motivo,
            String descrizione,
            int quantita
    ) {
    }

    public record CreaMessaggioRequest(
            String testo,
            TipoMittente mittente,
            Set<String> allegati
    ) {
    }

    @PostMapping
    public ResponseEntity<Reso> creaReso(@RequestBody CreaResoRequest request) {
        Reso nuovoReso = resoService.creaReso(request);
        return new ResponseEntity<>(nuovoReso, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reso> getResoById(@PathVariable Long id) {
        Reso reso = resoService.getResoById(id);
        return ResponseEntity.ok(reso);
    }

    @PostMapping("/{resoId}/messaggi")
    public ResponseEntity<Messaggio> aggiungiMessaggio(
            @PathVariable Long resoId,
            @RequestBody CreaMessaggioRequest request) {
        Messaggio nuovoMessaggio = resoService.aggiungiMessaggio(resoId, request);
        return new ResponseEntity<>(nuovoMessaggio, HttpStatus.CREATED);
    }
}