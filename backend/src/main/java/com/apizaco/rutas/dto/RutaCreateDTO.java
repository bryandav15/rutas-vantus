package com.apizaco.rutas.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class RutaCreateDTO {

    @NotBlank(message = "El número de ruta es requerido (ej: '07', '12')")
    private String numero;

    @NotBlank(message = "El nombre descriptivo de la ruta es requerido (ej: 'Apizaco - Huamantla')")
    private String nombre;

    private String colorHex;

    @NotNull(message = "El precio estimado es requerido")
    @Positive(message = "El precio debe ser mayor a 0")
    private BigDecimal precioEstimado;

    @NotNull(message = "La duración estimada en minutos es requerida")
    @Positive(message = "La duración debe ser mayor a 0")
    private Integer duracionMin;

    private Boolean activa = true;

    private List<ParadaCreateDTO> paradas = new ArrayList<>();

    public RutaCreateDTO() {
    }

    public RutaCreateDTO(String numero, String nombre, String colorHex, BigDecimal precioEstimado, Integer duracionMin, Boolean activa, List<ParadaCreateDTO> paradas) {
        this.numero = numero;
        this.nombre = nombre;
        this.colorHex = colorHex;
        this.precioEstimado = precioEstimado;
        this.duracionMin = duracionMin;
        this.activa = activa != null ? activa : true;
        this.paradas = paradas != null ? paradas : new ArrayList<>();
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getColorHex() {
        return colorHex;
    }

    public void setColorHex(String colorHex) {
        this.colorHex = colorHex;
    }

    public String getColor() {
        return colorHex;
    }

    public void setColor(String color) {
        this.colorHex = color;
    }

    public BigDecimal getPrecioEstimado() {
        return precioEstimado;
    }

    public void setPrecioEstimado(BigDecimal precioEstimado) {
        this.precioEstimado = precioEstimado;
    }

    public Integer getDuracionMin() {
        return duracionMin;
    }

    public void setDuracionMin(Integer duracionMin) {
        this.duracionMin = duracionMin;
    }

    public Boolean getActiva() {
        return activa;
    }

    public void setActiva(Boolean activa) {
        this.activa = activa;
    }

    public List<ParadaCreateDTO> getParadas() {
        return paradas;
    }

    public void setParadas(List<ParadaCreateDTO> paradas) {
        this.paradas = paradas;
    }
}
