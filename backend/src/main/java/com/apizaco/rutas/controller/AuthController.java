package com.apizaco.rutas.controller;

import com.apizaco.rutas.dto.LoginRequestDTO;
import com.apizaco.rutas.dto.LoginResponseDTO;
import com.apizaco.rutas.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        LoginResponseDTO response = authService.autenticar(request);
        if (!response.isAutenticado()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        return ResponseEntity.ok(response);
    }

    @GetMapping("/verificar")
    public ResponseEntity<Map<String, Object>> verificarToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extraerToken(authHeader);
        boolean valido = authService.validarToken(token);
        if (!valido) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valido", false, "mensaje", "Token inválido o expirado"));
        }
        return ResponseEntity.ok(Map.of("valido", true, "mensaje", "Token válido"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        String token = extraerToken(authHeader);
        authService.cerrarSesion(token);
        return ResponseEntity.ok(Map.of("mensaje", "Sesión cerrada correctamente"));
    }

    private String extraerToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        return authHeader;
    }
}
