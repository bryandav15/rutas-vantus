package com.apizaco.rutas.repository;

import com.apizaco.rutas.model.Parada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParadaRepository extends JpaRepository<Parada, Long> {
    List<Parada> findByRutaIdOrderByOrdenAsc(Long rutaId);

    @Modifying
    @Query("DELETE FROM Parada p WHERE p.ruta.id = :rutaId")
    void deleteByRutaId(@Param("rutaId") Long rutaId);
}
