package me.leoo.springboot.libri.security;

import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.utente.UtenteService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UtenteService utenteService;

    public String login(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        UserDetails userDetails = utenteService.loadUserByUsername(username);
        return jwtService.generateToken(userDetails);
    }
}