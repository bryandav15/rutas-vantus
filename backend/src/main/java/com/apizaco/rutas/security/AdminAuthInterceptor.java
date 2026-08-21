package com.apizaco.rutas.security;

import com.apizaco.rutas.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AdminAuthInterceptor implements HandlerInterceptor {

    private final AuthService authService;

    public AdminAuthInterceptor(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Añadir cabeceras de ciberseguridad en todas las respuestas
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("X-Frame-Options", "SAMEORIGIN");
        response.setHeader("X-XSS-Protection", "1; mode=block");
        response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

        // Permitir solicitudes pre-flight OPTIONS de CORS sin autenticación
        if (HttpMethod.OPTIONS.matches(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Determinar si la ruta requiere autenticación de administrador
        if (esRutaProtegida(method, path)) {
            String token = extraerToken(request);

            if (!authService.validarToken(token)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"mensaje\":\"Acceso denegado. Se requiere autenticación de administrador activa.\"}");
                return false;
            }
        }

        return true;
    }

    private boolean esRutaProtegida(String method, String path) {
        // 1. Modificación de Rutas (Crear, Editar, Activar/Desactivar, Eliminar)
        if (path.startsWith("/api/rutas")) {
            // Calificaciones públicas permitidas para ciudadanos
            if (path.contains("/calificaciones") && HttpMethod.POST.matches(method)) {
                return false;
            }
            // Consultas públicas permitidas
            if (HttpMethod.GET.matches(method)) {
                return false;
            }
            // Cualquier POST, PUT, PATCH, DELETE en rutas es administrativo
            return true;
        }

        // 2. Gestión de Sugerencias (Listado de admin, moderación, conversión en ruta oficial)
        if (path.startsWith("/api/sugerencias")) {
            // El envío público de reportes por parte de los ciudadanos está permitido
            if (path.equals("/api/sugerencias") && HttpMethod.POST.matches(method)) {
                return false;
            }
            // Ver listado de sugerencias, cambiar estados o publicar requiere admin
            return true;
        }

        return false;
    }

    private String extraerToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        String customToken = request.getHeader("X-Admin-Token");
        if (customToken != null && !customToken.isBlank()) {
            return customToken.trim();
        }

        return null;
    }
}
