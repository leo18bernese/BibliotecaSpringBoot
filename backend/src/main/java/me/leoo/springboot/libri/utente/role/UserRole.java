package me.leoo.springboot.libri.utente.role;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserRole {

    ADMIN("ROLE_ADMIN"),
    EDITOR("ROLE_EDITOR"),
    USER("ROLE_USER");

    private final String id;
}
