package com.apizaco.rutas.controller;

import com.apizaco.rutas.dto.RutaResponseDTO;
import com.apizaco.rutas.dto.SugerenciaDTO;
import com.apizaco.rutas.model.Ruta;
import com.apizaco.rutas.model.Sugerencia;
import com.apizaco.rutas.service.SugerenciaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sugerencias")
public class SugerenciaController {

    private final SugerenciaService sugerenciaService;

    public SugerenciaController(SugerenciaService sugerenciaService) {
        this.sugerenciaService = sugerenciaService;
    }

    @PostMapping
    public ResponseEntity<SugerenciaDTO> enviarSugerencia(@Valid @RequestBody SugerenciaDTO dto) {
        Sugerencia creada = sugerenciaService.registrarSugerencia(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(SugerenciaDTO.fromEntity(creada));
    }

    @GetMapping
    public List<SugerenciaDTO> listarSugerencias(@RequestParam(required = false) String estado) {
        List<Sugerencia> list = (estado != null && !estado.isBlank())
                ? sugerenciaService.listarPorEstado(estado)
                : sugerenciaService.listarTodas();

        return list.stream().map(SugerenciaDTO::fromEntity).toList();
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<SugerenciaDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String nuevoEstado = body.getOrDefault("estado", "PENDIENTE");
        Sugerencia actualizada = sugerenciaService.cambiarEstado(id, nuevoEstado);
        return ResponseEntity.ok(SugerenciaDTO.fromEntity(actualizada));
    }

    @PostMapping("/{id}/convertir-en-ruta")
    public ResponseEntity<RutaResponseDTO> convertirEnRuta(@PathVariable Long id) {
        Ruta rutaCreada = sugerenciaService.aprobarYConvertirEnRuta(id);
        if (rutaCreada != null) {
            return ResponseEntity.status(HttpStatus.CREATED).body(RutaResponseDTO.fromEntity(rutaCreada));
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        sugerenciaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
