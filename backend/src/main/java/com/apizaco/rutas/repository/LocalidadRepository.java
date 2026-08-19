package com.apizaco.rutas.repository;

import com.apizaco.rutas.model.Localidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LocalidadRepository extends JpaRepository<Localidad, Long> {
    Optional<Localidad> findByNombreIgnoreCase(String nombre);
}
