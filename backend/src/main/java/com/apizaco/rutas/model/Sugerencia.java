package com.apizaco.rutas.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sugerencia")
public class Sugerencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "ruta_referencia", length = 50)
    private String rutaReferencia;

    @Column(name = "nombre_contacto", length = 100)
    private String nombreContacto;

    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";

    @Column(name = "datos_ruta_json", columnDefinition = "TEXT")
    private String datosRutaJson;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        if (this.fechaCreacion == null) {
            this.fechaCreacion = LocalDateTime.now();
        }
        if (this.estado == null || this.estado.isBlank()) {
            this.estado = "PENDIENTE";
        }
    }

    public Sugerencia() {
    }

    public Sugerencia(Long id, String tipo, String titulo, String descripcion, String rutaReferencia, String nombreContacto, String estado, String datosRutaJson, LocalDateTime fechaCreacion) {
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
