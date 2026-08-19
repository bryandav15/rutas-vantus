package com.apizaco.rutas.service;

import com.apizaco.rutas.dto.ParadaCreateDTO;
import com.apizaco.rutas.dto.RutaCreateDTO;
import com.apizaco.rutas.dto.SugerenciaDTO;
import com.apizaco.rutas.model.Ruta;
import com.apizaco.rutas.model.Sugerencia;
import com.apizaco.rutas.repository.SugerenciaRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SugerenciaService {

    private final SugerenciaRepository sugerenciaRepository;
    private final RutaService rutaService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SugerenciaService(SugerenciaRepository sugerenciaRepository, RutaService rutaService) {
        this.sugerenciaRepository = sugerenciaRepository;
        this.rutaService = rutaService;
    }

    public Sugerencia registrarSugerencia(SugerenciaDTO dto) {
        Sugerencia sugerencia = dto.toEntity();
        sugerencia.setEstado("PENDIENTE");
        return sugerenciaRepository.save(sugerencia);
    }

    @Transactional(readOnly = true)
    public List<Sugerencia> listarTodas() {
        return sugerenciaRepository.findAllByOrderByFechaCreacionDesc();
    }

    @Transactional(readOnly = true)
    public List<Sugerencia> listarPorEstado(String estado) {
        return sugerenciaRepository.findByEstadoOrderByFechaCreacionDesc(estado.toUpperCase());
    }

    public Sugerencia cambiarEstado(Long id, String nuevoEstado) {
        Sugerencia sugerencia = sugerenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sugerencia no encontrada con ID: " + id));
        sugerencia.setEstado(nuevoEstado.toUpperCase());
        return sugerenciaRepository.save(sugerencia);
    }

    public Ruta aprobarYConvertirEnRuta(Long id) {
        Sugerencia sugerencia = sugerenciaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sugerencia no encontrada con ID: " + id));

        sugerencia.setEstado("APROBADA");
        sugerenciaRepository.save(sugerencia);

        // Si contiene datos de ruta JSON, construimos la ruta oficial
        if (sugerencia.getDatosRutaJson() != null && !sugerencia.getDatosRutaJson().isBlank()) {
            try {
                Map<String, Object> data = objectMapper.readValue(sugerencia.getDatosRutaJson(), Map.class);
                String numero = (String) data.getOrDefault("numero", "S/N");
                String nombre = (String) data.getOrDefault("nombre", sugerencia.getTitulo());
                String colorHex = (String) data.getOrDefault("colorHex", "#2F5233");
                Double precio = Double.valueOf(data.getOrDefault("precioEstimado", 10.0).toString());
                Integer duracion = Integer.valueOf(data.getOrDefault("duracionMin", 20).toString());

                List<Map<String, Object>> paradasList = (List<Map<String, Object>>) data.get("paradas");
                List<ParadaCreateDTO> paradasDto = new ArrayList<>();

                if (paradasList != null) {
                    int orden = 1;
                    for (Map<String, Object> p : paradasList) {
                        String pNombre = (String) p.getOrDefault("nombre", "Parada " + orden);
                        String pRef = (String) p.getOrDefault("referencia", null);
                        Double lat = Double.valueOf(p.get("lat").toString());
                        Double lng = Double.valueOf(p.get("lng").toString());
                        paradasDto.add(new ParadaCreateDTO(pNombre, "Apizaco", BigDecimal.valueOf(lat), BigDecimal.valueOf(lng), orden, pRef));
                        orden++;
                    }
                }

                RutaCreateDTO createDTO = new RutaCreateDTO(
                        numero,
                        nombre,
                        colorHex,
                        BigDecimal.valueOf(precio),
                        duracion,
                        true,
                        paradasDto
                );

                return rutaService.crearRuta(createDTO);
            } catch (Exception e) {
                throw new RuntimeException("Error al parsear datos de ruta sugerida: " + e.getMessage(), e);
            }
        }

        return null;
    }

    public void eliminar(Long id) {
        sugerenciaRepository.deleteById(id);
    }
}
