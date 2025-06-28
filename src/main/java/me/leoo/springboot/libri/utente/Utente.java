package me.leoo.springboot.libri.utente;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.carrello.Carrello;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Utente implements UserDetails {

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

    @OneToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private Carrello carrello;


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

    // Authorization
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

}
