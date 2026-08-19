package com.apizaco.rutas.repository;

import com.apizaco.rutas.model.Calificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CalificacionRepository extends JpaRepository<Calificacion, Long> {
    List<Calificacion> findByRutaIdOrderByFechaCreacionDesc(Long rutaId);
}
