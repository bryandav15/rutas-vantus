package com.apizaco.rutas.dto;

import com.apizaco.rutas.model.Sugerencia;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public class SugerenciaDTO {

    private Long id;

    @NotBlank(message = "El tipo de sugerencia o reporte es requerido")
    private String tipo;

    @NotBlank(message = "El título del reporte es requerido")
    private String titulo;

    @NotBlank(message = "La descripción o detalles del reporte son requeridos")
    private String descripcion;

    private String rutaReferencia;

    private String nombreContacto;

    private String estado;

    private String datosRutaJson;

    private LocalDateTime fechaCreacion;

    public SugerenciaDTO() {
    }

    public SugerenciaDTO(Long id, String tipo, String titulo, String descripcion, String rutaReferencia, String nombreContacto, String estado, String datosRutaJson, LocalDateTime fechaCreacion) {
        this.id = id;
        this.tipo = tipo;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.rutaReferencia = rutaReferencia;
        this.nombreContacto = nombreContacto;
        this.estado = estado;
        this.datosRutaJson = datosRutaJson;
        this.fechaCreacion = fechaCreacion;
    }

    public static SugerenciaDTO fromEntity(Sugerencia sugerencia) {
        if (sugerencia == null) return null;
        return new SugerenciaDTO(
                sugerencia.getId(),
                sugerencia.getTipo(),
                sugerencia.getTitulo(),
                sugerencia.getDescripcion(),
                sugerencia.getRutaReferencia(),
                sugerencia.getNombreContacto(),
                sugerencia.getEstado(),
                sugerencia.getDatosRutaJson(),
                sugerencia.getFechaCreacion()
        );
    }

    public Sugerencia toEntity() {
        Sugerencia s = new Sugerencia();
        s.setId(this.id);
        s.setTipo(this.tipo);
        s.setTitulo(this.titulo);
        s.setDescripcion(this.descripcion);
        s.setRutaReferencia(this.rutaReferencia);
        s.setNombreContacto(this.nombreContacto);
        s.setEstado(this.estado != null ? this.estado : "PENDIENTE");
        s.setDatosRutaJson(this.datosRutaJson);
        s.setFechaCreacion(this.fechaCreacion != null ? this.fechaCreacion : LocalDateTime.now());
        return s;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getRutaReferencia() {
        return rutaReferencia;
    }

    public void setRutaReferencia(String rutaReferencia) {
        this.rutaReferencia = rutaReferencia;
    }

    public String getNombreContacto() {
        return nombreContacto;
    }

    public void setNombreContacto(String nombreContacto) {
        this.nombreContacto = nombreContacto;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getDatosRutaJson() {
        return datosRutaJson;
    }

    public void setDatosRutaJson(String datosRutaJson) {
        this.datosRutaJson = datosRutaJson;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}
