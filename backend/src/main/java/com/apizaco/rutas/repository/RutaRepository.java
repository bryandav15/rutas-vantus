package com.apizaco.rutas.repository;

import com.apizaco.rutas.model.Ruta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RutaRepository extends JpaRepository<Ruta, Long> {

    @Query("SELECT DISTINCT r FROM Ruta r " +
           "LEFT JOIN r.paradas p " +
           "LEFT JOIN p.localidad l " +
           "WHERE (LOWER(r.numero) LIKE LOWER(CONCAT('%', :destino, '%')) OR " +
           "       LOWER(r.nombre) LIKE LOWER(CONCAT('%', :destino, '%')) OR " +
           "       (l.nombre IS NOT NULL AND LOWER(l.nombre) LIKE LOWER(CONCAT('%', :destino, '%'))) OR " +
           "       (p.referencia IS NOT NULL AND LOWER(p.referencia) LIKE LOWER(CONCAT('%', :destino, '%')))) " +
           "AND r.activa = true")
    List<Ruta> buscarPorDestino(@Param("destino") String destino);

    @Query("SELECT DISTINCT r FROM Ruta r WHERE r.activa = true")
    List<Ruta> findAllActivas();
}
