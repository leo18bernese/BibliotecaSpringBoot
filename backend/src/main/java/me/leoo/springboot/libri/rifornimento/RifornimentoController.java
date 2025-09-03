package me.leoo.springboot.libri.rifornimento;

import lombok.extern.slf4j.Slf4j;
import me.leoo.springboot.libri.carrello.common.PrenotazioneUtenteInfo;
import me.leoo.springboot.libri.carrello.item.CarrelloItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/rifornimento")
public class RifornimentoController {

    @Autowired
    private CarrelloItemRepository carrelloItemRepository;

    @GetMapping("/{libroId}/prenotazioni")
    public ResponseEntity<Page<PrenotazioneUtenteInfo>> getPrenotazioni(
            @PathVariable Long libroId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PrenotazioneUtenteInfo> prenotazioni = carrelloItemRepository
                .findPrenotazioniByLibroId(libroId, pageable);

        return ResponseEntity.ok(prenotazioni);
    }

    @GetMapping("/variante/{varianteId}/prenotazioni")
    public ResponseEntity<Page<PrenotazioneUtenteInfo>> getPrenotazioniByVarianteId(
            @PathVariable Long varianteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);

        Page<PrenotazioneUtenteInfo> prenotazioni = carrelloItemRepository
                .findPrenotazioniByVarianteId(varianteId, pageable);

        return ResponseEntity.ok(prenotazioni);
    }
}
