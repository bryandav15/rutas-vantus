package com.apizaco.rutas.dto;

import java.time.LocalDateTime;

public class LoginResponseDTO {

    private boolean autenticado;
    private String token;
    private String username;
    private String nombreCompleto;
    private String rol;
    private LocalDateTime fechaExpiracion;
    private String mensaje;

    public LoginResponseDTO() {
    }

    public LoginResponseDTO(boolean autenticado, String token, String username, String nombreCompleto, String rol, LocalDateTime fechaExpiracion, String mensaje) {
        this.autenticado = autenticado;
        this.token = token;
        this.username = username;
        this.nombreCompleto = nombreCompleto;
        this.rol = rol;
        this.fechaExpiracion = fechaExpiracion;
        this.mensaje = mensaje;
    }

    public static LoginResponseDTO exito(String token, String username, String nombreCompleto, String rol, LocalDateTime fechaExpiracion) {
        return new LoginResponseDTO(true, token, username, nombreCompleto, rol, fechaExpiracion, "Autenticación exitosa");
    }

    public static LoginResponseDTO error(String mensaje) {
        return new LoginResponseDTO(false, null, null, null, null, null, mensaje);
    }

    public boolean isAutenticado() {
        return autenticado;
    }

    public void setAutenticado(boolean autenticado) {
        this.autenticado = autenticado;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getRol() {
        return rol;
    }

    public void setRol(String rol) {
        this.rol = rol;
    }

    public LocalDateTime getFechaExpiracion() {
        return fechaExpiracion;
    }

    public void setFechaExpiracion(LocalDateTime fechaExpiracion) {
        this.fechaExpiracion = fechaExpiracion;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}
