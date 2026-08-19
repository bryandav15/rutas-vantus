package com.apizaco.rutas.repository;

import com.apizaco.rutas.model.Sugerencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SugerenciaRepository extends JpaRepository<Sugerencia, Long> {
    List<Sugerencia> findAllByOrderByFechaCreacionDesc();
    List<Sugerencia> findByEstadoOrderByFechaCreacionDesc(String estado);
}
