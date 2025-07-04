package me.leoo.springboot.libri.utente;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.spedizione.SpedizioneIndirizzo;
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

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "utente_wishlist",
            joinColumns = @JoinColumn(name = "utente_id"),
            inverseJoinColumns = @JoinColumn(name = "libro_id"))
    @JsonIgnore
    private Set<Libro> wishlist = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "utente_indirizzi", joinColumns = @JoinColumn(name = "utente_id"))
    private Set<SpedizioneIndirizzo> indirizzi = new HashSet<>();

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

    // Wishlist
    public void addToWishlist(Libro libro) {
        if (libro != null) {
            wishlist.add(libro);
        }
    }

    public void removeFromWishlist(Long libroId) {
        wishlist.removeIf(libro -> libro.getId().equals(libroId));
    }

    // Indirizzi di spedizione
    public void addIndirizzo(SpedizioneIndirizzo indirizzo) {
        if (indirizzo == null || !indirizzo.isValid()) {
            throw new IllegalArgumentException("Indirizzo non valido");
        }

        indirizzi.add(indirizzo);
    }

    public void removeIndirizzo(SpedizioneIndirizzo indirizzo) {
        indirizzi.remove(indirizzo);
    }

    // Authorization
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }

}
