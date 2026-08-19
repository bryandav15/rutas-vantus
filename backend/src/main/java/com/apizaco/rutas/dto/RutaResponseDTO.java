package com.apizaco.rutas.dto;

import com.apizaco.rutas.model.Ruta;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class RutaResponseDTO {

    private Long id;
    private String numero;
    private String color;
    private String nombre;
    private String origen;
    private String destino;
    private BigDecimal precio;
    private Integer duracionMin;
    private Double calificacionPromedio;
    private Integer totalCalificaciones;
    private List<ParadaDTO> paradas = new ArrayList<>();
    private List<CalificacionDTO> ultimasResenias = new ArrayList<>();

    public RutaResponseDTO() {
    }

    public RutaResponseDTO(Long id, String numero, String color, String nombre, String origen, String destino, BigDecimal precio, Integer duracionMin, Double calificacionPromedio, Integer totalCalificaciones, List<ParadaDTO> paradas, List<CalificacionDTO> ultimasResenias) {
        this.id = id;
        this.numero = numero;
        this.color = color;
        this.nombre = nombre;
        this.origen = origen;
        this.destino = destino;
        this.precio = precio;
        this.duracionMin = duracionMin;
        this.calificacionPromedio = calificacionPromedio != null ? calificacionPromedio : 4.5;
        this.totalCalificaciones = totalCalificaciones != null ? totalCalificaciones : 0;
        this.paradas = paradas != null ? paradas : new ArrayList<>();
        this.ultimasResenias = ultimasResenias != null ? ultimasResenias : new ArrayList<>();
    }

    public static RutaResponseDTO fromEntity(Ruta ruta) {
        if (ruta == null) {
            return null;
        }

        List<ParadaDTO> paradasDTO = (ruta.getParadas() != null)
                ? ruta.getParadas().stream().map(ParadaDTO::fromEntity).toList()
                : new ArrayList<>();

        String origen = !paradasDTO.isEmpty() ? paradasDTO.get(0).getNombre() : "Terminal Apizaco";
        String destino = !paradasDTO.isEmpty() ? paradasDTO.get(paradasDTO.size() - 1).getNombre() : "";

        if (ruta.getNombre() != null && ruta.getNombre().contains(" - ")) {
            String[] partes = ruta.getNombre().split(" - ", 2);
            if (partes.length == 2) {
                if (origen.isBlank() || origen.equals("Parada")) origen = partes[0].trim();
                if (destino.isBlank() || destino.equals("Parada")) destino = partes[1].trim();
            }
        }

        List<CalificacionDTO> resenias = (ruta.getCalificaciones() != null)
                ? ruta.getCalificaciones().stream().limit(5).map(CalificacionDTO::fromEntity).toList()
                : new ArrayList<>();

        int totalCal = (ruta.getCalificaciones() != null) ? ruta.getCalificaciones().size() : 0;
        double promedio = ruta.getPromedioCalificacion();

        return new RutaResponseDTO(
                ruta.getId(),
                ruta.getNumero(),
                ruta.getColorHex(),
                ruta.getNombre(),
                origen,
                destino,
                ruta.getPrecioEstimado(),
                ruta.getDuracionMin(),
                Math.round(promedio * 10.0) / 10.0,
                totalCal,
                paradasDTO,
                resenias
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getOrigen() {
        return origen;
    }

    public void setOrigen(String origen) {
        this.origen = origen;
    }

    public String getDestino() {
        return destino;
    }

    public void setDestino(String destino) {
        this.destino = destino;
    }

    public BigDecimal getPrecio() {
        return precio;
    }

    public void setPrecio(BigDecimal precio) {
        this.precio = precio;
    }

    public Integer getDuracionMin() {
        return duracionMin;
    }

    public void setDuracionMin(Integer duracionMin) {
        this.duracionMin = duracionMin;
    }

    public Double getCalificacionPromedio() {
        return calificacionPromedio;
    }

    public void setCalificacionPromedio(Double calificacionPromedio) {
        this.calificacionPromedio = calificacionPromedio;
    }

    public Integer getTotalCalificaciones() {
        return totalCalificaciones;
    }

    public void setTotalCalificaciones(Integer totalCalificaciones) {
        this.totalCalificaciones = totalCalificaciones;
    }

    public List<ParadaDTO> getParadas() {
        return paradas;
    }

    public void setParadas(List<ParadaDTO> paradas) {
        this.paradas = paradas;
    }

    public List<CalificacionDTO> getUltimasResenias() {
        return ultimasResenias;
    }

    public void setUltimasResenias(List<CalificacionDTO> ultimasResenias) {
        this.ultimasResenias = ultimasResenias;
    }
}
