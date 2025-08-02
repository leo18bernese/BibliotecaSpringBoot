package me.leoo.springboot.libri.libri;

import me.leoo.springboot.libri.libri.caratteristiche.CaratteristicaOpzione;
import me.leoo.springboot.libri.libri.caratteristiche.CaratteristicaOpzioneRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CaratteristicaOpzioneRepository caratteristicaOpzioneRepository;

    @Override
    public void run(String... args) throws Exception {
        // Controlla se i dati esistono già per evitare di inserirli ad ogni riavvio
        if (caratteristicaOpzioneRepository.count() > 0) {
            return;
        }

        System.out.println("Inizializzazione metadati caratteristiche...");

        CaratteristicaOpzione nero = new CaratteristicaOpzione();
        nero.setNomeCaratteristica("Colore");
        nero.setValoreOpzione("Nero");
        nero.setMetadata(Map.of("tipo", "colore", "valore", "#000000"));

        CaratteristicaOpzione bianco = new CaratteristicaOpzione();
        bianco.setNomeCaratteristica("Colore");
        bianco.setValoreOpzione("Bianco");
        bianco.setMetadata(Map.of("tipo", "colore", "valore", "#FFFFFF"));

        CaratteristicaOpzione blu = new CaratteristicaOpzione();
        blu.setNomeCaratteristica("Colore");
        blu.setValoreOpzione("Blu");
        blu.setMetadata(Map.of("tipo", "colore", "valore", "#0000FF"));

        caratteristicaOpzioneRepository.saveAll(List.of(nero, bianco, blu));
        
        System.out.println("Metadati caratteristiche inizializzati.");
    }
}