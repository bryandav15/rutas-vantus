USE rutas_apizaco;

-- Desactivar llaves foráneas temporalmente para limpieza segura si se reejecuta
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE calificacion;
TRUNCATE TABLE sugerencia;
TRUNCATE TABLE parada;
TRUNCATE TABLE ruta;
TRUNCATE TABLE localidad;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Inserción de Localidades
INSERT INTO localidad (nombre, municipio, lat, lng) VALUES
('Terminal Apizaco', 'Apizaco', 19.4128000, -98.1428000),
('Base Texcalac Centro', 'Apizaco', 19.4350000, -98.1150000),
('Crucero Santa Anita', 'Apizaco', 19.4230000, -98.1300000),
('Panotla', 'Panotla', 19.3667000, -98.2000000),
('Tlaxcala Centro', 'Tlaxcala', 19.3182000, -98.2374000),
('Santa Cruz Tlaxcala', 'Santa Cruz Tlaxcala', 19.3850000, -98.0700000),
('Huamantla Centro', 'Huamantla', 19.3106000, -97.9142000),
('Yauhquemehcan', 'Yauhquemehcan', 19.3800000, -98.1500000),
('Santa Ana Chiautempan', 'Chiautempan', 19.3167000, -98.1833000);

-- 2. Inserción de Rutas
INSERT INTO ruta (numero, nombre, color_hex, precio_estimado, duracion_min, activa) VALUES
('Texcalac', 'Texcalac - Apizaco Centro', '#10b981', 10.00, 18, TRUE),
('07', 'Apizaco - Tlaxcala Centro', '#2F5233', 12.00, 25, TRUE),
('12', 'Apizaco - Huamantla', '#C9A227', 18.00, 35, TRUE),
('03', 'Apizaco - Chiautempan', '#7A2E2E', 10.00, 20, TRUE),
('21', 'Apizaco - Santa Cruz Tlaxcala', '#2F5233', 9.00, 15, TRUE);

-- 3. Inserción de Paradas con Referencias de Calle y Base

-- Ruta Texcalac: Texcalac - Apizaco Centro
INSERT INTO parada (ruta_id, localidad_id, orden, lat, lng, referencia) VALUES
((SELECT id FROM ruta WHERE numero='Texcalac' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Base Texcalac Centro' LIMIT 1), 1, 19.4350000, -98.1150000, 'Calle Hidalgo frente al parque y kiosco central'),
((SELECT id FROM ruta WHERE numero='Texcalac' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Crucero Santa Anita' LIMIT 1), 2, 19.4230000, -98.1300000, 'Entronque carretera federal'),
((SELECT id FROM ruta WHERE numero='Texcalac' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Terminal Apizaco' LIMIT 1), 3, 19.4128000, -98.1428000, 'Calle Cuauhtémoc frente a Farmacias Guadalajara');

-- Ruta 07: Apizaco - Tlaxcala Centro
INSERT INTO parada (ruta_id, localidad_id, orden, lat, lng, referencia) VALUES
((SELECT id FROM ruta WHERE numero='07' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Terminal Apizaco' LIMIT 1), 1, 19.4128000, -98.1428000, 'Calle Cuauhtémoc esq. 2 de Abril'),
((SELECT id FROM ruta WHERE numero='07' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Panotla' LIMIT 1), 2, 19.3667000, -98.2000000, 'Entrada principal sobre autopista'),
((SELECT id FROM ruta WHERE numero='07' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Tlaxcala Centro' LIMIT 1), 3, 19.3182000, -98.2374000, 'Parada Plaza Juárez frente a los Portales');

-- Ruta 12: Apizaco - Huamantla
INSERT INTO parada (ruta_id, localidad_id, orden, lat, lng, referencia) VALUES
((SELECT id FROM ruta WHERE numero='12' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Terminal Apizaco' LIMIT 1), 1, 19.4128000, -98.1428000, 'Base Huamantla en Blvd. Emilio Sánchez Piedras'),
((SELECT id FROM ruta WHERE numero='12' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Santa Cruz Tlaxcala' LIMIT 1), 2, 19.3850000, -98.0700000, 'Parada de la capilla'),
((SELECT id FROM ruta WHERE numero='12' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Huamantla Centro' LIMIT 1), 3, 19.3106000, -97.9142000, 'Parque Juárez y Parroquia de San Luis');

-- Ruta 03: Apizaco - Chiautempan
INSERT INTO parada (ruta_id, localidad_id, orden, lat, lng, referencia) VALUES
((SELECT id FROM ruta WHERE numero='03' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Terminal Apizaco' LIMIT 1), 1, 19.4128000, -98.1428000, 'Base mercado 12 de Mayo'),
((SELECT id FROM ruta WHERE numero='03' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Yauhquemehcan' LIMIT 1), 2, 19.3800000, -98.1500000, 'Cruce San Dionisio'),
((SELECT id FROM ruta WHERE numero='03' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Santa Ana Chiautempan' LIMIT 1), 3, 19.3167000, -98.1833000, 'Estación del Tren y Mercado de Artesanías');

-- Ruta 21: Apizaco - Santa Cruz Tlaxcala
INSERT INTO parada (ruta_id, localidad_id, orden, lat, lng, referencia) VALUES
((SELECT id FROM ruta WHERE numero='21' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Terminal Apizaco' LIMIT 1), 1, 19.4128000, -98.1428000, 'Calle Aquiles Serdán'),
((SELECT id FROM ruta WHERE numero='21' LIMIT 1), (SELECT id FROM localidad WHERE nombre='Santa Cruz Tlaxcala' LIMIT 1), 2, 19.3850000, -98.0700000, 'Centro Vacacional La Trinidad');
