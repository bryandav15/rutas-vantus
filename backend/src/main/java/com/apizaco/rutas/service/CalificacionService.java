package com.apizaco.rutas.service;

import com.apizaco.rutas.dto.CalificacionDTO;
import com.apizaco.rutas.model.Calificacion;
import com.apizaco.rutas.model.Ruta;
import com.apizaco.rutas.repository.CalificacionRepository;
import com.apizaco.rutas.repository.RutaRepository;
import com.apizaco.rutas.util.SecuritySanitizer;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CalificacionService {

    private final CalificacionRepository calificacionRepository;
    private final RutaRepository rutaRepository;

    public CalificacionService(CalificacionRepository calificacionRepository, RutaRepository rutaRepository) {
        this.calificacionRepository = calificacionRepository;
        this.rutaRepository = rutaRepository;
    }

    public Calificacion agregarCalificacion(Long rutaId, CalificacionDTO dto) {
        Ruta ruta = rutaRepository.findById(rutaId)
                .orElseThrow(() -> new RuntimeException("Ruta no encontrada con ID: " + rutaId));

        Calificacion cal = new Calificacion();
        cal.setRuta(ruta);
        cal.setPuntuacion(dto.getPuntuacion());
        cal.setComentario(SecuritySanitizer.sanitizarTexto(dto.getComentario()));
        String usuarioLimpio = SecuritySanitizer.sanitizarTexto(dto.getNombreUsuario());
        cal.setNombreUsuario(usuarioLimpio != null && !usuarioLimpio.isBlank() ? usuarioLimpio : "Pasajero");

        return calificacionRepository.save(cal);
    }

    @Transactional(readOnly = true)
    public List<Calificacion> obtenerPorRuta(Long rutaId) {
        return calificacionRepository.findByRutaIdOrderByFechaCreacionDesc(rutaId);
    }
}
