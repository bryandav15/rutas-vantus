package com.apizaco.rutas.service;

import com.apizaco.rutas.dto.LoginRequestDTO;
import com.apizaco.rutas.dto.LoginResponseDTO;
import com.apizaco.rutas.model.UsuarioAdmin;
import com.apizaco.rutas.repository.UsuarioAdminRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final UsuarioAdminRepository usuarioAdminRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    // Sesiones activas en memoria: Token -> Informacion de Sesion
    private final Map<String, AdminSession> activeSessions = new ConcurrentHashMap<>();

    private static final int MAX_INTENTOS_FALLIDOS = 5;
    private static final int MINUTOS_BLOQUEO = 15;
    private static final int HORAS_DURACION_TOKEN = 8;

    @Value("${admin.default.username:admin}")
    private String defaultAdminUsername;

    @Value("${admin.default.password:AdminApizaco2026!}")
    private String defaultAdminPassword;

    public AuthService(UsuarioAdminRepository usuarioAdminRepository) {
        this.usuarioAdminRepository = usuarioAdminRepository;
        this.passwordEncoder = new BCryptPasswordEncoder(12);
    }

    @PostConstruct
    @Transactional
    public void inicializarAdminPorDefecto() {
        if (!usuarioAdminRepository.existsByUsername(defaultAdminUsername)) {
            String hashBcrypt = passwordEncoder.encode(defaultAdminPassword);
            UsuarioAdmin nuevoAdmin = new UsuarioAdmin(
                    defaultAdminUsername,
                    hashBcrypt,
                    "Administrador Central Apizaco",
                    "ROLE_ADMIN"
            );
            usuarioAdminRepository.save(nuevoAdmin);
            System.out.println(">>> [Seguridad]: Administrador inicial 'admin' creado exitosamente con contraseña cifrada en BCrypt.");
        }
    }

    @Transactional
    public LoginResponseDTO autenticar(LoginRequestDTO request) {
        String usernameLimpio = request.getUsername().trim();
        Optional<UsuarioAdmin> usuarioOpt = usuarioAdminRepository.findByUsername(usernameLimpio);

        if (usuarioOpt.isEmpty()) {
            return LoginResponseDTO.error("Credenciales incorrectas.");
        }

        UsuarioAdmin usuario = usuarioOpt.get();

        // 1. Verificar si la cuenta está bloqueada temporalmente por fuerza bruta
        if (usuario.getBloqueadoHasta() != null) {
            if (usuario.getBloqueadoHasta().isAfter(LocalDateTime.now())) {
                return LoginResponseDTO.error(
                        "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta de nuevo más tarde."
                );
            } else {
                // El tiempo de bloqueo ya expiró, reiniciamos el contador
                usuario.setBloqueadoHasta(null);
                usuario.setIntentosFallidos(0);
            }
        }

        // 2. Verificar contraseña con BCrypt
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            int intentos = usuario.getIntentosFallidos() + 1;
            usuario.setIntentosFallidos(intentos);

            if (intentos >= MAX_INTENTOS_FALLIDOS) {
                usuario.setBloqueadoHasta(LocalDateTime.now().plusMinutes(MINUTOS_BLOQUEO));
                usuarioAdminRepository.save(usuario);
                return LoginResponseDTO.error(
                        "Has alcanzado el límite de 5 intentos fallidos. Cuenta bloqueada por " + MINUTOS_BLOQUEO + " minutos por seguridad."
                );
            }

            usuarioAdminRepository.save(usuario);
            int intentosRestantes = MAX_INTENTOS_FALLIDOS - intentos;
            return LoginResponseDTO.error(
                    "Contraseña incorrecta. Te quedan " + intentosRestantes + " intentos antes de bloqueo temporal."
            );
        }

        // 3. Autenticación Exitosa: Limpiar intentos fallidos y actualizar último acceso
        usuario.setIntentosFallidos(0);
        usuario.setBloqueadoHasta(null);
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioAdminRepository.save(usuario);

        // 4. Generar Token Criptográfico Seguro
        String token = generarTokenSeguro();
        LocalDateTime fechaExpiracion = LocalDateTime.now().plusHours(HORAS_DURACION_TOKEN);

        AdminSession session = new AdminSession(usuario.getUsername(), usuario.getRol(), fechaExpiracion);
        activeSessions.put(token, session);

        return LoginResponseDTO.exito(
                token,
                usuario.getUsername(),
                usuario.getNombreCompleto(),
                usuario.getRol(),
                fechaExpiracion
        );
    }

    public boolean validarToken(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        AdminSession session = activeSessions.get(token.trim());
        if (session == null) {
            return false;
        }

        if (session.getFechaExpiracion().isBefore(LocalDateTime.now())) {
            activeSessions.remove(token.trim());
            return false;
        }

        return true;
    }

    public void cerrarSesion(String token) {
        if (token != null && !token.isBlank()) {
            activeSessions.remove(token.trim());
        }
    }

    private String generarTokenSeguro() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    public static class AdminSession {
        private final String username;
        private final String rol;
        private final LocalDateTime fechaExpiracion;

        public AdminSession(String username, String rol, LocalDateTime fechaExpiracion) {
            this.username = username;
            this.rol = rol;
            this.fechaExpiracion = fechaExpiracion;
        }

        public String getUsername() {
            return username;
        }

        public String getRol() {
            return rol;
        }

        public LocalDateTime getFechaExpiracion() {
            return fechaExpiracion;
        }
    }
}
