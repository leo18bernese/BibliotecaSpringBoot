package me.leoo.springboot.libri.libri.autore;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AutoreService {
    @Autowired
    private AutoreRepository autoreRepository;

    public Autore getOrCreate(Autore autore) {
        if (autore == null || autore.getNome() == null) return null;

        return autoreRepository.findByNome(autore.getNome())
                .orElseGet(() -> autoreRepository.save(autore));
    }

    public Autore getOrCreate(String nome, String descrizione) {
        if (nome == null || nome.isBlank()) return null;

        return autoreRepository.findByNome(nome)
                .orElseGet(() -> autoreRepository.save(new Autore(nome, descrizione)));
    }
}

