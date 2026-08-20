package com.apizaco.rutas.service;

import com.apizaco.rutas.dto.ParadaCreateDTO;
import com.apizaco.rutas.dto.RutaCreateDTO;
import com.apizaco.rutas.model.Localidad;
import com.apizaco.rutas.model.Parada;
import com.apizaco.rutas.model.Ruta;
import com.apizaco.rutas.repository.LocalidadRepository;
import com.apizaco.rutas.repository.RutaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class RutaService {

    private final RutaRepository rutaRepository;
    private final LocalidadRepository localidadRepository;

    public RutaService(RutaRepository rutaRepository, LocalidadRepository localidadRepository) {
        this.rutaRepository = rutaRepository;
        this.localidadRepository = localidadRepository;
    }

    @Transactional(readOnly = true)
    public List<Ruta> buscarRutas(String destino) {
        if (destino == null || destino.isBlank()) {
            return rutaRepository.findAllActivas();
        }
        return rutaRepository.buscarPorDestino(destino.trim());
    }

    @Transactional(readOnly = true)
    public List<Ruta> listarTodas() {
        return rutaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Ruta> obtenerPorId(Long id) {
        return rutaRepository.findById(id);
    }

    public Ruta crearRuta(RutaCreateDTO dto) {
        Ruta ruta = new Ruta();
        ruta.setNumero(dto.getNumero().trim());
        ruta.setNombre(dto.getNombre().trim());
        String col = dto.getColorHex() != null && !dto.getColorHex().isBlank() ? dto.getColorHex() : dto.getColor();
        ruta.setColorHex(col != null && !col.isBlank() ? col.trim() : "#2F5233");
        ruta.setPrecioEstimado(dto.getPrecioEstimado());
        ruta.setDuracionMin(dto.getDuracionMin());
        ruta.setActiva(dto.getActiva() != null ? dto.getActiva() : true);

        List<Parada> paradas = construirParadas(ruta, dto.getParadas());
        ruta.setParadas(paradas);

        return rutaRepository.save(ruta);
    }

    public Ruta actualizarRuta(Long id, RutaCreateDTO dto) {
        Ruta ruta = rutaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ruta no encontrada con ID: " + id));

        if (dto.getNumero() != null && !dto.getNumero().isBlank()) {
            ruta.setNumero(dto.getNumero().trim());
        }
        if (dto.getNombre() != null && !dto.getNombre().isBlank()) {
            ruta.setNombre(dto.getNombre().trim());
        }
        String col = dto.getColorHex() != null && !dto.getColorHex().isBlank() ? dto.getColorHex() : dto.getColor();
        if (col != null && !col.isBlank()) {
            ruta.setColorHex(col.trim());
        }
        if (dto.getPrecioEstimado() != null) {
            ruta.setPrecioEstimado(dto.getPrecioEstimado());
        }
        if (dto.getDuracionMin() != null) {
            ruta.setDuracionMin(dto.getDuracionMin());
        }
        if (dto.getActiva() != null) {
            ruta.setActiva(dto.getActiva());
        }

        if (dto.getParadas() != null && !dto.getParadas().isEmpty()) {
            ruta.getParadas().clear();
            List<Parada> nuevasParadas = construirParadas(ruta, dto.getParadas());
            ruta.getParadas().addAll(nuevasParadas);
        }

        return rutaRepository.save(ruta);
    }

    public Ruta toggleActiva(Long id) {
        Ruta ruta = rutaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ruta no encontrada con ID: " + id));
        ruta.setActiva(!Boolean.TRUE.equals(ruta.getActiva()));
        return rutaRepository.save(ruta);
    }

    public void eliminarRuta(Long id) {
        rutaRepository.deleteById(id);
    }

    private List<Parada> construirParadas(Ruta ruta, List<ParadaCreateDTO> dtoList) {
        List<Parada> result = new ArrayList<>();
        if (dtoList == null) return result;

        int orden = 1;
        for (ParadaCreateDTO pDto : dtoList) {
            String nombreParada = pDto.getNombre() != null && !pDto.getNombre().isBlank()
                    ? pDto.getNombre().trim()
                    : "Parada " + orden;

            Localidad localidad = localidadRepository.findFirstByNombreIgnoreCase(nombreParada)
                    .orElseGet(() -> {
                        Localidad nueva = new Localidad();
                        nueva.setNombre(nombreParada);
                        nueva.setMunicipio(pDto.getMunicipio() != null && !pDto.getMunicipio().isBlank() ? pDto.getMunicipio().trim() : "Apizaco");
                        nueva.setLat(pDto.getLat() != null ? pDto.getLat() : java.math.BigDecimal.valueOf(19.4128));
                        nueva.setLng(pDto.getLng() != null ? pDto.getLng() : java.math.BigDecimal.valueOf(-98.1428));
                        return localidadRepository.save(nueva);
                    });

            Parada parada = new Parada();
            parada.setRuta(ruta);
            parada.setLocalidad(localidad);
            parada.setOrden(pDto.getOrden() != null ? pDto.getOrden() : orden);
            parada.setLat(pDto.getLat() != null ? pDto.getLat() : java.math.BigDecimal.valueOf(19.4128));
            parada.setLng(pDto.getLng() != null ? pDto.getLng() : java.math.BigDecimal.valueOf(-98.1428));
            parada.setReferencia(pDto.getReferencia() != null && !pDto.getReferencia().isBlank() ? pDto.getReferencia().trim() : null);
            result.add(parada);
            orden++;
        }
        return result;
    }
}
