package me.leoo.springboot.libri.spedizione;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
@RequestMapping("/api/spedizione")
public class SpedizioneController {

    // DTO
    public record LuogoSpedizione(String id, String description) {
    }

    @GetMapping("/methods")
    public Spedizioniere[] getSpedizioneMethods() {
        return Spedizione.getCorrieri().toArray(new Spedizioniere[0]);
    }

    @GetMapping("/methods/name/{id}")
    public Spedizioniere getSpedizioniereById(@PathVariable String id) {
        return Spedizione.getById(id);
    }

    @GetMapping("/methods/type/{id}")
    public ResponseEntity<?> getTipoSpedizioneById(@PathVariable String id) {
        try {
            SpedizioneLuogo luogo = SpedizioneLuogo.valueOf(id.toUpperCase());

            return ResponseEntity.ok(Spedizione.getByType(luogo).toArray(new Spedizioniere[0]));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Impossibile trovare corrieri al momento");
        }

    }


    @GetMapping("/places")
    public LuogoSpedizione[] getLuoghiSpedizione() {
        return Arrays.stream(SpedizioneLuogo.values())
                .map(luogo -> new LuogoSpedizione(luogo.name(), luogo.getDescrizione()))
                .toArray(LuogoSpedizione[]::new);
    }
}
