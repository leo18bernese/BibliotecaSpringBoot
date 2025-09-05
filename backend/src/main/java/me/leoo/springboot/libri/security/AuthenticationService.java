package me.leoo.springboot.libri.security;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import me.leoo.springboot.libri.utente.UtenteService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UtenteService utenteService;
    private final HttpServletRequest request;

    public String login(String username, String password) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        UserDetails userDetails = utenteService.loadUserByUsername(username);


        // Get IP and User-Agent from the request
        String ipAddress = request.getHeader("X-Real-IP");
        if (ipAddress == null) {
            ipAddress = request.getRemoteAddr();
        }
        String userAgent = request.getHeader("User-Agent");

        // Generate a unique session ID and track the login event
        String sessionId = UUID.randomUUID().toString();
        utenteService.saveUserLoginHistory(username, ipAddress, userAgent, sessionId);

        // Generate JWT token including the session ID as a claim
        return jwtService.generateToken(userDetails, sessionId);
    }
}