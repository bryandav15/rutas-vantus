package com.apizaco.rutas.repository;

import com.apizaco.rutas.model.Parada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParadaRepository extends JpaRepository<Parada, Long> {
    List<Parada> findByRutaIdOrderByOrdenAsc(Long rutaId);
}
