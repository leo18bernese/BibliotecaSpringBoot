package me.leoo.springboot.libri.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/csrf-token")
public class CsrfController {

    @GetMapping
    public CsrfToken getCsrfToken(HttpServletRequest request) {
        System.out.println("crsf " + Arrays.stream(request.getCookies()).map(c -> c.getName() + "=" + c.getValue()).toList());
        return (CsrfToken) request.getAttribute(CsrfToken.class.getName());
    }
}