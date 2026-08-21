CREATE DATABASE IF NOT EXISTS rutas_apizaco
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE rutas_apizaco;

-- Tabla de Localidades / Puntos de interés
CREATE TABLE IF NOT EXISTS localidad (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    municipio VARCHAR(100),
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,
    INDEX idx_localidad_nombre (nombre)
) ENGINE=InnoDB;

-- Tabla de Rutas de transporte
CREATE TABLE IF NOT EXISTS ruta (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    color_hex VARCHAR(20) NOT NULL DEFAULT '#2F5233',
    precio_estimado DECIMAL(6, 2) NOT NULL,
    duracion_min INT NOT NULL,
    activa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- Tabla de Paradas ordenadas por ruta
CREATE TABLE IF NOT EXISTS parada (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ruta_id BIGINT NOT NULL,
    localidad_id BIGINT NOT NULL,
    orden INT NOT NULL,
    lat DECIMAL(10, 7) NOT NULL,
    lng DECIMAL(10, 7) NOT NULL,
    referencia VARCHAR(255),
    FOREIGN KEY (ruta_id) REFERENCES ruta(id) ON DELETE CASCADE,
    FOREIGN KEY (localidad_id) REFERENCES localidad(id),
    UNIQUE KEY uq_ruta_orden (ruta_id, orden)
) ENGINE=InnoDB;

-- Tabla de Sugerencias y Reportes de la Comunidad
CREATE TABLE IF NOT EXISTS sugerencia (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL,
    ruta_referencia VARCHAR(50),
    nombre_contacto VARCHAR(100),
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    datos_ruta_json TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de Calificaciones y Reseñas de Rutas
CREATE TABLE IF NOT EXISTS calificacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ruta_id BIGINT NOT NULL,
    puntuacion INT NOT NULL,
    comentario TEXT,
    nombre_usuario VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ruta_id) REFERENCES ruta(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabla de Usuarios Administradores con contraseñas cifradas en BCrypt
CREATE TABLE IF NOT EXISTS usuario_admin (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    nombre_completo VARCHAR(100),
    rol VARCHAR(20) NOT NULL DEFAULT 'ROLE_ADMIN',
    intentos_fallidos INT NOT NULL DEFAULT 0,
    bloqueado_hasta DATETIME,
    ultimo_acceso DATETIME
) ENGINE=InnoDB;
