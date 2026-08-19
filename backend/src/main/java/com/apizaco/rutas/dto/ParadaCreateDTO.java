package com.apizaco.rutas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ParadaCreateDTO {

    @NotBlank(message = "El nombre de la parada o localidad es requerido")
    private String nombre;

    private String municipio;

    @NotNull(message = "La latitud es requerida")
    private BigDecimal lat;

    @NotNull(message = "La longitud es requerida")
    private BigDecimal lng;

    private Integer orden;

    private String referencia; // Notas de la base, calle, esquina, etc.

    public ParadaCreateDTO() {
    }

    public ParadaCreateDTO(String nombre, String municipio, BigDecimal lat, BigDecimal lng, Integer orden, String referencia) {
        this.nombre = nombre;
        this.municipio = municipio;
        this.lat = lat;
        this.lng = lng;
        this.orden = orden;
        this.referencia = referencia;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getMunicipio() {
        return municipio;
    }

    public void setMunicipio(String municipio) {
        this.municipio = municipio;
    }

    public BigDecimal getLat() {
        return lat;
    }

    public void setLat(BigDecimal lat) {
        this.lat = lat;
    }

    public BigDecimal getLng() {
        return lng;
    }

    public void setLng(BigDecimal lng) {
        this.lng = lng;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }
}
