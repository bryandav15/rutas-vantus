package com.apizaco.rutas.controller;

import com.apizaco.rutas.dto.RutaCreateDTO;
import com.apizaco.rutas.dto.RutaResponseDTO;
import com.apizaco.rutas.model.Ruta;
import com.apizaco.rutas.service.RutaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rutas")
public class RutaController {

    private final RutaService rutaService;

    public RutaController(RutaService rutaService) {
        this.rutaService = rutaService;
    }

    @GetMapping("/buscar")
    public List<RutaResponseDTO> buscar(@RequestParam(required = false) String destino) {
        return rutaService.buscarRutas(destino)
                .stream()
                .map(RutaResponseDTO::fromEntity)
                .toList();
    }

    @GetMapping
    public List<RutaResponseDTO> listarTodas() {
        return rutaService.listarTodas()
                .stream()
                .map(RutaResponseDTO::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RutaResponseDTO> obtenerPorId(@PathVariable Long id) {
        return rutaService.obtenerPorId(id)
                .map(r -> ResponseEntity.ok(RutaResponseDTO.fromEntity(r)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RutaResponseDTO> crearRuta(@Valid @RequestBody RutaCreateDTO dto) {
        Ruta creada = rutaService.crearRuta(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(RutaResponseDTO.fromEntity(creada));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RutaResponseDTO> actualizarRuta(@PathVariable Long id, @Valid @RequestBody RutaCreateDTO dto) {
        Ruta actualizada = rutaService.actualizarRuta(id, dto);
        return ResponseEntity.ok(RutaResponseDTO.fromEntity(actualizada));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<RutaResponseDTO> toggleActiva(@PathVariable Long id) {
        Ruta ruta = rutaService.toggleActiva(id);
        return ResponseEntity.ok(RutaResponseDTO.fromEntity(ruta));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRuta(@PathVariable Long id) {
        rutaService.eliminarRuta(id);
        return ResponseEntity.noContent().build();
    }
}
