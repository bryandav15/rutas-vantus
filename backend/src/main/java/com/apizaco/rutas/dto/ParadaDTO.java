package com.apizaco.rutas.dto;

import com.apizaco.rutas.model.Parada;
import java.math.BigDecimal;

public class ParadaDTO {

    private String nombre;
    private BigDecimal lat;
    private BigDecimal lng;
    private String referencia;

    public ParadaDTO() {
    }

    public ParadaDTO(String nombre, BigDecimal lat, BigDecimal lng, String referencia) {
        this.nombre = nombre;
        this.lat = lat;
        this.lng = lng;
        this.referencia = referencia;
    }

    public static ParadaDTO fromEntity(Parada parada) {
        if (parada == null) {
            return null;
        }
        String nombre = (parada.getLocalidad() != null) ? parada.getLocalidad().getNombre() : "Parada";
        return new ParadaDTO(nombre, parada.getLat(), parada.getLng(), parada.getReferencia());
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
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

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }
}
