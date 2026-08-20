// Modo Offline / Mock Data (Comentado temporalmente según requerimiento)
// import { mockRoutes } from '../data/mockRoutes';
// const STORAGE_KEY_ROUTES = 'rutas_apizaco_local_routes';
// const STORAGE_KEY_SUGGESTIONS = 'rutas_apizaco_local_suggestions';
// export function getLocalRoutes() { ... }
// export function saveLocalRoutes(routes) { ... }
// export function getLocalSuggestions() { ... }
// export function saveLocalSuggestions(suggestions) { ... }

const API_BASE_URL = '/api';

const HEADERS_DEFAULT = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true'
};

/**
 * Consulta las rutas directamente desde la base de datos MySQL (Backend Spring Boot)
 */
export async function buscarRutas(destino = '') {
  const url = destino && destino.trim()
    ? `${API_BASE_URL}/rutas/buscar?destino=${encodeURIComponent(destino.trim())}`
    : `${API_BASE_URL}/rutas/buscar`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[MySQL Backend Error ${response.status}]:`, errText);
      throw new Error(`Error en servidor MySQL: HTTP ${response.status}`);
    }

    const backendRoutes = await response.json();

    // Normalizar color y datos recibidos de MySQL
    const normalized = (Array.isArray(backendRoutes) ? backendRoutes : []).map(r => ({
      ...r,
      color: r.color || r.colorHex || '#2F5233',
      colorHex: r.colorHex || r.color || '#2F5233'
    }));

    return { data: normalized, isLive: true };
  } catch (error) {
    console.error('[Error de Conexión a Base de Datos MySQL]:', error.message);
    // Modo offline deshabilitado: retornamos arreglo vacío si MySQL no contesta
    return { data: [], isLive: false, error: error.message };
  }
}

/**
 * Crear una nueva ruta directamente en MySQL
 */
export async function crearRuta(rutaData) {
  const response = await fetch(`${API_BASE_URL}/rutas`, {
    method: 'POST',
    headers: HEADERS_DEFAULT,
    body: JSON.stringify(rutaData)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[MySQL Crear Ruta Error]:', response.status, errText);
    throw new Error(`Error al crear ruta en MySQL (HTTP ${response.status})`);
  }

  const created = await response.json();
  const normalized = {
    ...created,
    color: created.color || created.colorHex || rutaData.colorHex || '#10b981',
    colorHex: created.colorHex || created.color || rutaData.colorHex || '#10b981'
  };

  return { data: normalized, isLive: true };
}

/**
 * Actualizar una ruta existente directamente en MySQL
 */
export async function actualizarRuta(id, rutaData) {
  const response = await fetch(`${API_BASE_URL}/rutas/${id}`, {
    method: 'PUT',
    headers: HEADERS_DEFAULT,
    body: JSON.stringify(rutaData)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[MySQL Actualizar Ruta Error]:', response.status, errText);
    throw new Error(`Error al actualizar ruta en MySQL (HTTP ${response.status}): ${errText}`);
  }

  const updated = await response.json();
  const cleanColor = updated.color || updated.colorHex || rutaData.colorHex || rutaData.color || '#2F5233';
  const normalized = {
    ...updated,
    color: cleanColor,
    colorHex: cleanColor
  };

  return { data: normalized, isLive: true };
}

/**
 * Eliminar una ruta directamente de MySQL
 */
export async function eliminarRuta(id) {
  const response = await fetch(`${API_BASE_URL}/rutas/${id}`, { 
    method: 'DELETE',
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });

  if (!response.ok) {
    throw new Error(`Error al eliminar ruta en MySQL (HTTP ${response.status})`);
  }

  return { success: true, isLive: true };
}

/**
 * Enviar sugerencia comunitaria directamente a MySQL
 */
export async function enviarSugerencia(sugerenciaData) {
  const response = await fetch(`${API_BASE_URL}/sugerencias`, {
    method: 'POST',
    headers: HEADERS_DEFAULT,
    body: JSON.stringify(sugerenciaData)
  });

  if (!response.ok) {
    throw new Error(`Error al guardar sugerencia en MySQL (HTTP ${response.status})`);
  }

  const savedSug = await response.json();
  return { data: savedSug, isLive: true };
}

/**
 * Obtener sugerencias directamente desde MySQL (Admin)
 */
export async function obtenerSugerencias(estado = '') {
  const url = estado && estado !== 'TODAS'
    ? `${API_BASE_URL}/sugerencias?estado=${encodeURIComponent(estado)}`
    : `${API_BASE_URL}/sugerencias`;

  const response = await fetch(url, {
    headers: { 
      'Accept': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    }
  });

  if (!response.ok) {
    console.error('[MySQL Sugerencias Error]:', response.status);
    return { data: [], isLive: false };
  }

  const backendSug = await response.json();
  return { data: backendSug, isLive: true };
}

/**
 * Cambiar estado de sugerencia directamente en MySQL (Aprobar/Rechazar)
 */
export async function cambiarEstadoSugerencia(id, nuevoEstado) {
  const response = await fetch(`${API_BASE_URL}/sugerencias/${id}/estado`, {
    method: 'PUT',
    headers: HEADERS_DEFAULT,
    body: JSON.stringify({ estado: nuevoEstado })
  });

  if (!response.ok) {
    throw new Error(`Error al actualizar estado en MySQL (HTTP ${response.status})`);
  }

  return { success: true, isLive: true };
}

/**
 * Aprobar y convertir una ruta sugerida en ruta oficial en MySQL
 */
export async function aprobarYPublicarRutaSugerida(sugerenciaId) {
  const response = await fetch(`${API_BASE_URL}/sugerencias/${sugerenciaId}/convertir-en-ruta`, { 
    method: 'POST',
    headers: { 'ngrok-skip-browser-warning': 'true' }
  });

  if (!response.ok) {
    throw new Error(`Error al convertir sugerencia en ruta MySQL (HTTP ${response.status})`);
  }

  const createdRoute = await response.json();
  return { data: createdRoute, isLive: true };
}

/**
 * Enviar Calificación y Reseña de Ruta directamente a MySQL
 */
export async function calificarRuta(rutaId, calificacionData) {
  const response = await fetch(`${API_BASE_URL}/rutas/${rutaId}/calificaciones`, {
    method: 'POST',
    headers: HEADERS_DEFAULT,
    body: JSON.stringify(calificacionData)
  });

  if (!response.ok) {
    throw new Error(`Error al calificar ruta en MySQL (HTTP ${response.status})`);
  }

  const reseniaGuardada = await response.json();
  return { data: reseniaGuardada, isLive: true };
}
