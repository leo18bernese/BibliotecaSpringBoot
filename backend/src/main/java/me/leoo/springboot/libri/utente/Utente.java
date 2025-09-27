package me.leoo.springboot.libri.utente;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import me.leoo.springboot.libri.carrello.Carrello;
import me.leoo.springboot.libri.libri.Libro;
import me.leoo.springboot.libri.spedizione.SpedizioneIndirizzo;
import me.leoo.springboot.libri.utente.role.UserRole;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.HashSet;
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
    private String telefono;

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

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    @JoinColumn(name = "utente_id") // Foreign key nella tabella spedizione_indirizzo
    private Set<SpedizioneIndirizzo> indirizzi = new HashSet<>();

    public Utente(String username, String password, String nome, String cognome, String email) {
        this.username = username;
        this.password = password;
        this.nome = nome;
        this.cognome = cognome;
        this.email = email;

        System.out.println("creato utente " + username);
    }

    public Utente updateFrom(UtenteController.UpdateUserRequest request) {
        this.nome = request.nome();
        this.cognome = request.cognome();
        this.telefono = request.telefono();
        return this;
    }

    // Ruoli
    public void addRuolo(UserRole ruolo) {
        ruoli.add(ruolo.getId());
    }

    public void removeRuolo(UserRole ruolo) {
        ruoli.remove(ruolo.getId());
    }

    public boolean isAdmin() {
        return ruoli.contains(UserRole.ADMIN.getId());
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
        return ruoli.stream()
                .map(ruolo -> (GrantedAuthority) () -> ruolo)
                .toList();
    }

}
