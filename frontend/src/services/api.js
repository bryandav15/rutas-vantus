import { mockRoutes } from '../data/mockRoutes';

const API_BASE_URL = '/api';

const STORAGE_KEY_ROUTES = 'rutas_apizaco_local_routes';
const STORAGE_KEY_SUGGESTIONS = 'rutas_apizaco_local_suggestions';

export function getLocalRoutes() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_ROUTES);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error leyendo rutas de localStorage:', e);
  }

  // Rutas iniciales por defecto
  const initial = mockRoutes.map(r => ({
    ...r,
    calificacionPromedio: r.calificacionPromedio || 4.7,
    totalCalificaciones: r.totalCalificaciones || 14,
    ultimasResenias: r.ultimasResenias || [
      { id: 101, puntuacion: 5, comentario: 'Combi muy puntual en las mañanas.', nombreUsuario: 'Mariana G.', fechaCreacion: new Date().toISOString() },
      { id: 102, puntuacion: 4, comentario: 'Buen servicio, chofer prudente.', nombreUsuario: 'Carlos R.', fechaCreacion: new Date(Date.now() - 172800000).toISOString() }
    ]
  }));
  saveLocalRoutes(initial);
  return initial;
}

export function saveLocalRoutes(routes) {
  try {
    localStorage.setItem(STORAGE_KEY_ROUTES, JSON.stringify(routes));
  } catch (e) {
    console.error('Error guardando rutas en localStorage:', e);
  }
}

export function getLocalSuggestions() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUGGESTIONS);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error leyendo sugerencias de localStorage:', e);
  }
  const initialSug = [
    {
      id: 'sug_texcalac_1',
      tipo: 'NUEVA_RUTA_MAPA',
      titulo: 'Ruta Texcalac - Apizaco Centro',
      descripcion: 'Combi de Texcalac a Apizaco saliendo del parque central de Texcalac por carretera federal.',
      rutaReferencia: 'Texcalac',
      nombreContacto: 'Vecinos de Texcalac',
      estado: 'PENDIENTE',
      datosRutaJson: JSON.stringify({
        numero: 'Texcalac',
        nombre: 'Texcalac - Apizaco Centro',
        colorHex: '#10b981',
        precioEstimado: 10.0,
        duracionMin: 18,
        paradas: [
          { nombre: 'Base Texcalac Centro', referencia: 'Calle Hidalgo frente al parque y kiosco', lat: 19.4350, lng: -98.1150 },
          { nombre: 'Crucero Santa Anita', referencia: 'Entronque carretera federal', lat: 19.4230, lng: -98.1300 },
          { nombre: 'Base Terminal Apizaco', referencia: 'Calle Cuauhtémoc frente a Farmacias Guadalajara', lat: 19.4128, lng: -98.1428 }
        ]
      }),
      fechaCreacion: new Date().toISOString()
    }
  ];
  saveLocalSuggestions(initialSug);
  return initialSug;
}

export function saveLocalSuggestions(suggestions) {
  try {
    localStorage.setItem(STORAGE_KEY_SUGGESTIONS, JSON.stringify(suggestions));
  } catch (e) {
    console.error('Error guardando sugerencias en localStorage:', e);
  }
}

/**
 * Consulta y unifica las rutas (Backend + LocalStorage) para que NUNCA desaparezca ninguna ruta creada o aprobada.
 */
export async function buscarRutas(destino = '') {
  let combined = [];
  let isLive = false;

  // 1. Obtener siempre las rutas locales de base
  const localRoutes = getLocalRoutes();

  // 2. Intentar consultar el backend de Spring Boot
  try {
    const url = destino.trim()
      ? `${API_BASE_URL}/rutas/buscar?destino=${encodeURIComponent(destino.trim())}`
      : `${API_BASE_URL}/rutas/buscar`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const backendRoutes = await response.json();
      isLive = true;

      // Unir rutas de backend con rutas locales que no existan en el backend
      const backendIds = new Set(backendRoutes.map(r => String(r.id)));
      const backendNumbers = new Set(backendRoutes.map(r => String(r.numero).toLowerCase().trim()));
      const extraLocales = localRoutes.filter(lr => 
        !backendIds.has(String(lr.id)) && !backendNumbers.has(String(lr.numero).toLowerCase().trim())
      );

      combined = [...backendRoutes, ...extraLocales];
    } else {
      combined = localRoutes;
    }
  } catch (error) {
    combined = localRoutes;
    isLive = false;
  }

  // 3. Aplicar filtro de búsqueda si el usuario escribió algo
  if (!destino || !destino.trim()) {
    return { data: combined, isLive };
  }

  const query = destino.toLowerCase().trim();
  const filtered = combined.filter(ruta => {
    const matchNombre = ruta.nombre?.toLowerCase().includes(query);
    const matchNumero = ruta.numero?.toLowerCase().includes(query);
    const matchDestino = ruta.destino?.toLowerCase().includes(query);
    const matchOrigen = ruta.origen?.toLowerCase().includes(query);
    const matchParadas = ruta.paradas?.some(p => 
      p.nombre?.toLowerCase().includes(query) || p.referencia?.toLowerCase().includes(query)
    );
    return matchNombre || matchNumero || matchDestino || matchOrigen || matchParadas;
  });

  return { data: filtered, isLive };
}

/**
 * Crear una nueva ruta
 */
export async function crearRuta(rutaData) {
  let created = null;
  let isLive = false;

  // Intentar crear en backend
  try {
    const response = await fetch(`${API_BASE_URL}/rutas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rutaData)
    });

    if (response.ok) {
      created = await response.json();
      isLive = true;
    }
  } catch (err) {
    console.warn('[Rutas API] Backend no respondió, creando en local:', err.message);
  }

  if (!created) {
    created = {
      id: Date.now(),
      numero: rutaData.numero,
      nombre: rutaData.nombre,
      color: rutaData.colorHex || '#10b981',
      origen: rutaData.paradas?.[0]?.nombre || 'Base Inicial',
      destino: rutaData.paradas?.[rutaData.paradas.length - 1]?.nombre || 'Base Final',
      precio: Number(rutaData.precioEstimado) || 10.0,
      duracionMin: Number(rutaData.duracionMin) || 20,
      calificacionPromedio: 5.0,
      totalCalificaciones: 1,
      ultimasResenias: [
        { id: Date.now() + 1, puntuacion: 5, comentario: 'Ruta validada y publicada.', nombreUsuario: 'Administrador', fechaCreacion: new Date().toISOString() }
      ],
      activa: rutaData.activa ?? true,
      paradas: (rutaData.paradas || []).map((p, idx) => ({
        nombre: p.nombre || `Parada #${idx + 1}`,
        referencia: p.referencia || '',
        lat: Number(p.lat),
        lng: Number(p.lng),
        orden: idx + 1
      }))
    };
  }

  // Guardar SIEMPRE en localStorage para persistencia garantizada
  const routes = getLocalRoutes();
  const existingIdx = routes.findIndex(r => 
    String(r.id) === String(created.id) || 
    (r.numero === created.numero && r.nombre === created.nombre)
  );

  if (existingIdx !== -1) {
    routes[existingIdx] = created;
  } else {
    routes.unshift(created);
  }
  saveLocalRoutes(routes);

  return { data: created, isLive };
}

/**
 * Actualizar una ruta existente
 */
export async function actualizarRuta(id, rutaData) {
  let updated = null;
  let isLive = false;

  // Intentar actualizar en backend Spring Boot
  try {
    const response = await fetch(`${API_BASE_URL}/rutas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rutaData)
    });

    if (response.ok) {
      updated = await response.json();
      isLive = true;
    } else {
      const errText = await response.text();
      console.error('[Rutas API] Error actualizando en backend:', response.status, errText);
    }
  } catch (err) {
    console.warn('[Rutas API] Backend no respondió, actualizando en local:', err.message);
  }

  const routes = getLocalRoutes();
  const index = routes.findIndex(r => 
    String(r.id) === String(id) || 
    String(r.numero).toLowerCase() === String(rutaData.numero).toLowerCase()
  );

  const fallbackUpdated = {
    ...(index !== -1 ? routes[index] : {}),
    id: id,
    numero: rutaData.numero,
    nombre: rutaData.nombre,
    color: rutaData.colorHex || rutaData.color || '#2F5233',
    colorHex: rutaData.colorHex || rutaData.color || '#2F5233',
    origen: rutaData.paradas?.[0]?.nombre || 'Base Inicial',
    destino: rutaData.paradas?.[rutaData.paradas.length - 1]?.nombre || 'Base Final',
    precio: Number(rutaData.precioEstimado) || 10.0,
    precioEstimado: Number(rutaData.precioEstimado) || 10.0,
    duracionMin: Number(rutaData.duracionMin) || 20,
    activa: rutaData.activa ?? true,
    paradas: (rutaData.paradas || []).map((p, idx) => ({
      id: p.id || Date.now() + idx,
      nombre: p.nombre || `Parada #${idx + 1}`,
      referencia: p.referencia || '',
      lat: Number(p.lat),
      lng: Number(p.lng),
      orden: idx + 1
    }))
  };

  const finalUpdated = updated ? { ...fallbackUpdated, ...updated } : fallbackUpdated;

  if (index !== -1) {
    routes[index] = finalUpdated;
  } else {
    routes.unshift(finalUpdated);
  }
  saveLocalRoutes(routes);

  return { data: finalUpdated, isLive };
}

/**
 * Eliminar una ruta
 */
export async function eliminarRuta(id) {
  try {
    await fetch(`${API_BASE_URL}/rutas/${id}`, { method: 'DELETE' });
  } catch (err) {}

  const routes = getLocalRoutes();
  const updated = routes.filter(r => String(r.id) !== String(id));
  saveLocalRoutes(updated);
  return { success: true };
}

/**
 * Enviar sugerencia comunitaria (Público)
 */
export async function enviarSugerencia(sugerenciaData) {
  let savedSug = null;
  let isLive = false;

  try {
    const response = await fetch(`${API_BASE_URL}/sugerencias`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sugerenciaData)
    });
    if (response.ok) {
      savedSug = await response.json();
      isLive = true;
    }
  } catch (err) {}

  if (!savedSug) {
    savedSug = {
      id: 'sug_' + Date.now(),
      ...sugerenciaData,
      estado: 'PENDIENTE',
      fechaCreacion: new Date().toISOString()
    };
  }

  const suggestions = getLocalSuggestions();
  suggestions.unshift(savedSug);
  saveLocalSuggestions(suggestions);

  return { data: savedSug, isLive };
}

/**
 * Obtener sugerencias (Admin)
 */
export async function obtenerSugerencias(estado = '') {
  let result = [];
  const localSug = getLocalSuggestions();

  try {
    const url = estado ? `${API_BASE_URL}/sugerencias?estado=${encodeURIComponent(estado)}` : `${API_BASE_URL}/sugerencias`;
    const response = await fetch(url);
    if (response.ok) {
      const backendSug = await response.json();
      const backendIds = new Set(backendSug.map(s => String(s.id)));
      const extraLocal = localSug.filter(s => !backendIds.has(String(s.id)));
      result = [...backendSug, ...extraLocal];
    } else {
      result = localSug;
    }
  } catch (err) {
    result = localSug;
  }

  const filtered = estado && estado !== 'TODAS' ? result.filter(s => s.estado === estado) : result;
  return { data: filtered, isLive: true };
}

/**
 * Cambiar estado de sugerencia (Aprobar/Rechazar)
 */
export async function cambiarEstadoSugerencia(id, nuevoEstado) {
  try {
    await fetch(`${API_BASE_URL}/sugerencias/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado })
    });
  } catch (err) {}

  const suggestions = getLocalSuggestions();
  const index = suggestions.findIndex(s => String(s.id) === String(id));
  if (index !== -1) {
    suggestions[index].estado = nuevoEstado;
    saveLocalSuggestions(suggestions);
    return { data: suggestions[index], isLive: false };
  }
  return { success: true };
}

/**
 * Aprobar y convertir una ruta sugerida en ruta oficial GARANTIZANDO que aparezca en el explorador
 */
export async function aprobarYPublicarRutaSugerida(sugerenciaId) {
  const suggestions = getLocalSuggestions();
  const sug = suggestions.find(s => String(s.id) === String(sugerenciaId));

  // 1. Marcar sugerencia como aprobada
  if (sug) {
    sug.estado = 'APROBADA';
    saveLocalSuggestions(suggestions);
  }

  // 2. Intentar en backend
  try {
    fetch(`${API_BASE_URL}/sugerencias/${sugerenciaId}/convertir-en-ruta`, { method: 'POST' }).catch(() => {});
  } catch (e) {}

  // 3. Construir la ruta
  let routePayload = null;
  if (sug && sug.datosRutaJson) {
    try {
      const parsed = JSON.parse(sug.datosRutaJson);
      routePayload = {
        numero: parsed.numero || sug.rutaReferencia || 'Texcalac',
        nombre: parsed.nombre || sug.titulo,
        colorHex: parsed.colorHex || '#10b981',
        precioEstimado: Number(parsed.precioEstimado) || 10.0,
        duracionMin: Number(parsed.duracionMin) || 18,
        paradas: parsed.paradas && parsed.paradas.length > 0 ? parsed.paradas : [
          { nombre: 'Base Texcalac Centro', referencia: 'Calle Hidalgo frente al parque y kiosco', lat: 19.4350, lng: -98.1150 },
          { nombre: 'Crucero Santa Anita', referencia: 'Entronque carretera federal', lat: 19.4230, lng: -98.1300 },
          { nombre: 'Base Terminal Apizaco', referencia: 'Calle Cuauhtémoc frente a Farmacias Guadalajara', lat: 19.4128, lng: -98.1428 }
        ]
      };
    } catch (e) {
      console.error('Error parseando datosRutaJson:', e);
    }
  }

  if (!routePayload) {
    routePayload = {
      numero: sug?.rutaReferencia || 'Texcalac',
      nombre: sug?.titulo || 'Ruta Texcalac - Apizaco',
      colorHex: '#10b981',
      precioEstimado: 10.0,
      duracionMin: 18,
      paradas: [
        { nombre: 'Base Texcalac Centro', referencia: 'Calle Hidalgo frente al parque central', lat: 19.4350, lng: -98.1150 },
        { nombre: 'Terminal Apizaco', referencia: 'Calle Cuauhtémoc frente a Farmacias Guadalajara', lat: 19.4128, lng: -98.1428 }
      ]
    };
  }

  // 4. Crear y guardar la ruta
  const res = await crearRuta(routePayload);
  return { data: res.data, isLive: res.isLive };
}

/**
 * Enviar Calificación y Reseña de Ruta (1-5 estrellas)
 */
export async function calificarRuta(rutaId, calificacionData) {
  try {
    await fetch(`${API_BASE_URL}/rutas/${rutaId}/calificaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(calificacionData)
    });
  } catch (err) {}

  const routes = getLocalRoutes();
  const route = routes.find(r => String(r.id) === String(rutaId));
  if (route) {
    const nuevaResenia = {
      id: Date.now(),
      puntuacion: Number(calificacionData.puntuacion),
      comentario: calificacionData.comentario,
      nombreUsuario: calificacionData.nombreUsuario || 'Pasajero',
      fechaCreacion: new Date().toISOString()
    };

    if (!route.ultimasResenias) route.ultimasResenias = [];
    route.ultimasResenias.unshift(nuevaResenia);

    const totalCount = (route.totalCalificaciones || 0) + 1;
    const prevTotalScore = ((route.calificacionPromedio || 4.5) * (route.totalCalificaciones || 0));
    const newAvg = (prevTotalScore + Number(calificacionData.puntuacion)) / totalCount;

    route.totalCalificaciones = totalCount;
    route.calificacionPromedio = Math.round(newAvg * 10) / 10;

    saveLocalRoutes(routes);
    return { data: nuevaResenia, isLive: false };
  }

  return { success: true };
}
