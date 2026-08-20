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
           "LEFT JOIN FETCH r.paradas p " +
           "LEFT JOIN FETCH p.localidad l " +
           "WHERE (LOWER(l.nombre) LIKE LOWER(CONCAT('%', :destino, '%')) OR LOWER(r.nombre) LIKE LOWER(CONCAT('%', :destino, '%'))) " +
           "AND r.activa = true")
    List<Ruta> buscarPorDestino(@Param("destino") String destino);

    @Query("SELECT DISTINCT r FROM Ruta r " +
           "LEFT JOIN FETCH r.paradas p " +
           "LEFT JOIN FETCH p.localidad l " +
           "WHERE r.activa = true")
    List<Ruta> findAllActivas();

    @Query("SELECT DISTINCT r FROM Ruta r " +
           "LEFT JOIN FETCH r.paradas p " +
           "LEFT JOIN FETCH p.localidad l")
    List<Ruta> findAll();
}
