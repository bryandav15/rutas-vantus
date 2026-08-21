// Modo Offline / Mock Data (Comentado temporalmente según requerimiento)
// import { mockRoutes } from '../data/mockRoutes';
// const STORAGE_KEY_ROUTES = 'rutas_apizaco_local_routes';
// const STORAGE_KEY_SUGGESTIONS = 'rutas_apizaco_local_suggestions';
// export function getLocalRoutes() { ... }
// export function saveLocalRoutes(routes) { ... }

const API_BASE_URL = '/api';
const AUTH_TOKEN_KEY = 'rutas_admin_auth_token';
const AUTH_USER_KEY = 'rutas_admin_auth_user';

export function getAuthToken() {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function getAuthUser() {
  const data = sessionStorage.getItem(AUTH_USER_KEY);
  try {
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

export function isAdminAuthenticated() {
  return !!getAuthToken();
}

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

function getHeaders(requireAuth = false) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  };

  if (requireAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

/**
 * Autenticación de Administrador
 */
export async function loginAdmin(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();

  if (response.ok && data.autenticado && data.token) {
    sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
    sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify({
      username: data.username,
      nombreCompleto: data.nombreCompleto,
      rol: data.rol
    }));
    return data;
  }

  return {
    autenticado: false,
    mensaje: data.mensaje || 'Error de autenticación'
  };
}

export async function verificarSesionAdmin() {
  const token = getAuthToken();
  if (!token) return false;

  try {
    const response = await fetch(`${API_BASE_URL}/auth/verificar`, {
      method: 'GET',
      headers: getHeaders(true)
    });
    if (response.ok) {
      const data = await response.json();
      return data.valido === true;
    }
    clearAuthSession();
    return false;
  } catch (e) {
    return false;
  }
}

export async function logoutAdmin() {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(true)
      });
    } catch (e) {
      // ignore
    }
  }
  clearAuthSession();
}

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
    return { data: [], isLive: false, error: error.message };
  }
}

/**
 * Crear una nueva ruta directamente en MySQL (Requiere Auth)
 */
export async function crearRuta(rutaData) {
  const response = await fetch(`${API_BASE_URL}/rutas`, {
    method: 'POST',
    headers: getHeaders(true),
    body: JSON.stringify(rutaData)
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      throw new Error('Sesión de administrador expirada. Vuelve a iniciar sesión.');
    }
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
 * Actualizar una ruta existente directamente en MySQL (Requiere Auth)
 */
export async function actualizarRuta(id, rutaData) {
  const response = await fetch(`${API_BASE_URL}/rutas/${id}`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify(rutaData)
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      throw new Error('Sesión de administrador expirada. Vuelve a iniciar sesión.');
    }
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
 * Eliminar una ruta directamente de MySQL (Requiere Auth)
 */
export async function eliminarRuta(id) {
  const response = await fetch(`${API_BASE_URL}/rutas/${id}`, { 
    method: 'DELETE',
    headers: getHeaders(true)
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      throw new Error('Sesión de administrador expirada.');
    }
    throw new Error(`Error al eliminar ruta en MySQL (HTTP ${response.status})`);
  }

  return { success: true, isLive: true };
}

/**
 * Enviar sugerencia comunitaria directamente a MySQL (Público)
 */
export async function enviarSugerencia(sugerenciaData) {
  const response = await fetch(`${API_BASE_URL}/sugerencias`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(sugerenciaData)
  });

  if (!response.ok) {
    throw new Error(`Error al guardar sugerencia en MySQL (HTTP ${response.status})`);
  }

  const savedSug = await response.json();
  return { data: savedSug, isLive: true };
}

/**
 * Obtener sugerencias directamente desde MySQL (Requiere Auth)
 */
export async function obtenerSugerencias(estado = '') {
  const url = estado && estado !== 'TODAS'
    ? `${API_BASE_URL}/sugerencias?estado=${encodeURIComponent(estado)}`
    : `${API_BASE_URL}/sugerencias`;

  const response = await fetch(url, {
    headers: getHeaders(true)
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }
    console.error('[MySQL Sugerencias Error]:', response.status);
    return { data: [], isLive: false };
  }

  const backendSug = await response.json();
  return { data: backendSug, isLive: true };
}

/**
 * Cambiar estado de sugerencia directamente en MySQL (Requiere Auth)
 */
export async function cambiarEstadoSugerencia(id, nuevoEstado) {
  const response = await fetch(`${API_BASE_URL}/sugerencias/${id}/estado`, {
    method: 'PUT',
    headers: getHeaders(true),
    body: JSON.stringify({ estado: nuevoEstado })
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      throw new Error('Sesión de administrador expirada.');
    }
    throw new Error(`Error al actualizar estado en MySQL (HTTP ${response.status})`);
  }

  return { success: true, isLive: true };
}

/**
 * Aprobar y convertir una ruta sugerida en ruta oficial en MySQL (Requiere Auth)
 */
export async function aprobarYPublicarRutaSugerida(sugerenciaId) {
  const response = await fetch(`${API_BASE_URL}/sugerencias/${sugerenciaId}/convertir-en-ruta`, { 
    method: 'POST',
    headers: getHeaders(true)
  });

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
      throw new Error('Sesión de administrador expirada.');
    }
    throw new Error(`Error al convertir sugerencia en ruta MySQL (HTTP ${response.status})`);
  }

  const createdRoute = await response.json();
  return { data: createdRoute, isLive: true };
}

/**
 * Enviar Calificación y Reseña de Ruta directamente a MySQL (Público)
 */
export async function calificarRuta(rutaId, calificacionData) {
  const response = await fetch(`${API_BASE_URL}/rutas/${rutaId}/calificaciones`, {
    method: 'POST',
    headers: getHeaders(false),
    body: JSON.stringify(calificacionData)
  });

  if (!response.ok) {
    throw new Error(`Error al calificar ruta en MySQL (HTTP ${response.status})`);
  }

  const reseniaGuardada = await response.json();
  return { data: reseniaGuardada, isLive: true };
}
