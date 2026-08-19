package com.apizaco.rutas.dto;

import com.apizaco.rutas.model.Calificacion;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class CalificacionDTO {

    private Long id;
    private Long rutaId;

    @NotNull(message = "La puntuación de estrellas es obligatoria")
    @Min(value = 1, message = "La puntuación mínima es 1 estrella")
    @Max(value = 5, message = "La puntuación máxima es 5 estrellas")
    private Integer puntuacion;

    private String comentario;

    private String nombreUsuario;

    private LocalDateTime fechaCreacion;

    public CalificacionDTO() {
    }

    public CalificacionDTO(Long id, Long rutaId, Integer puntuacion, String comentario, String nombreUsuario, LocalDateTime fechaCreacion) {
        this.id = id;
        this.rutaId = rutaId;
        this.puntuacion = puntuacion;
        this.comentario = comentario;
        this.nombreUsuario = nombreUsuario;
        this.fechaCreacion = fechaCreacion;
    }

    public static CalificacionDTO fromEntity(Calificacion calificacion) {
        if (calificacion == null) return null;
        return new CalificacionDTO(
                calificacion.getId(),
                calificacion.getRuta() != null ? calificacion.getRuta().getId() : null,
                calificacion.getPuntuacion(),
                calificacion.getComentario(),
                calificacion.getNombreUsuario(),
                calificacion.getFechaCreacion()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getRutaId() {
        return rutaId;
    }

    public void setRutaId(Long rutaId) {
        this.rutaId = rutaId;
    }

    public Integer getPuntuacion() {
        return puntuacion;
    }

    public void setPuntuacion(Integer puntuacion) {
        this.puntuacion = puntuacion;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public void setNombreUsuario(String nombreUsuario) {
        this.nombreUsuario = nombreUsuario;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
