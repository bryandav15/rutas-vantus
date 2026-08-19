package com.apizaco.rutas.controller;

import com.apizaco.rutas.dto.CalificacionDTO;
import com.apizaco.rutas.model.Calificacion;
import com.apizaco.rutas.service.CalificacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rutas/{rutaId}/calificaciones")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "*"})
public class CalificacionController {

    private final CalificacionService calificacionService;

    public CalificacionController(CalificacionService calificacionService) {
        this.calificacionService = calificacionService;
    }

    @PostMapping
    public ResponseEntity<CalificacionDTO> calificar(
            @PathVariable Long rutaId,
            @Valid @RequestBody CalificacionDTO dto) {
        Calificacion guardada = calificacionService.agregarCalificacion(rutaId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(CalificacionDTO.fromEntity(guardada));
    }

    @GetMapping
    public List<CalificacionDTO> listarPorRuta(@PathVariable Long rutaId) {
        return calificacionService.obtenerPorRuta(rutaId)
                .stream()
                .map(CalificacionDTO::fromEntity)
                .toList();
    }
}
