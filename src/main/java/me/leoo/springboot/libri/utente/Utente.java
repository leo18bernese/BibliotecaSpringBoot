package me.leoo.springboot.libri.utente;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.carrello.CarrelloRepository;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Utente {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    private String password;

    private String nome;
    private String cognome;
    private String email;

    @ElementCollection(fetch = FetchType.EAGER)
    private Set<String> ruoli = new HashSet<>();

    public Utente(String username, String password, String nome, String cognome, String email) {
        this.username = username;
        this.password = password;
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;

        System.out.println("creato utente " + username);
    }

    // Ruoli
    public void addRuolo(String ruolo) {
        ruoli.add(ruolo);
    }

    public void removeRuolo(String ruolo) {
        ruoli.remove(ruolo);
    }
}
