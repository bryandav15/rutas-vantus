import React, { useState, useEffect } from 'react';
import {
  Plus, Trash2, Edit3, CheckCircle, XCircle, Clock, DollarSign,
  MapPin, Layers, Save, ArrowLeft, MessageSquare, AlertCircle, Sparkles, Navigation,
  RotateCcw, ArrowUpDown, ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  crearRuta,
  actualizarRuta,
  eliminarRuta,
  obtenerSugerencias,
  cambiarEstadoSugerencia,
  aprobarYPublicarRutaSugerida
} from '../services/api';

const APIZACO_CENTER = [19.4128, -98.1428];

function MapClickHandler({ onMapClick }) {
  const map = useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  return null;
}

function createDesignerMarkerIcon(index, total, color) {
  const isFirst = index === 0;
  const isLast = index === total - 1 && total > 1;
  const bgColor = isFirst ? '#10b981' : isLast ? '#ef4444' : (color || '#2F5233');
  const label = isFirst ? 'Origen' : isLast ? 'Destino' : `${index + 1}`;

  const html = `
    <div class="custom-map-marker-pin designer-pin" style="--pin-color: ${bgColor}">
      <div class="marker-bubble">
        <span class="marker-seq">${isFirst ? 'A' : isLast ? 'B' : index + 1}</span>
      </div>
      <div class="marker-label-tag visible">${label}</div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-div-icon',
    html,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34]
  });
}

export default function AdminPanel({
  rutas = [],
  onRouteCreated,
  onRouteDeleted,
  onClose
}) {
  const [activeTab, setActiveTab] = useState('list');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionFilter, setSuggestionFilter] = useState('TODAS');
  const [isLoadingSug, setIsLoadingSug] = useState(false);

  // Edit Route State
  const [editingRouteId, setEditingRouteId] = useState(null);

  // New/Edit Route Form State
  const [numero, setNumero] = useState('');
  const [nombre, setNombre] = useState('');
  const [colorHex, setColorHex] = useState('#2F5233');
  const [precioEstimado, setPrecioEstimado] = useState('10.00');
  const [duracionMin, setDuracionMin] = useState('20');
  const [paradas, setParadas] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const COLOR_PALETTE = ['#2F5233', '#1e40af', '#b45309', '#7c2d12', '#6b21a8', '#0f766e', '#be123c'];

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    setIsLoadingSug(true);
    try {
      const res = await obtenerSugerencias();
      setSuggestions(res.data || []);
    } catch (e) {
      console.error('Error cargando sugerencias:', e);
    } finally {
      setIsLoadingSug(false);
    }
  };

  const handleMapClick = (latlng) => {
    let defaultName = '';
    let defaultRef = '';

    if (paradas.length === 0) {
      defaultName = 'Base de Salida / Origen';
      defaultRef = 'Ubicación exacta de la base inicial';
    } else if (paradas.length === 1) {
      defaultName = 'Base de Llegada / Destino';
      defaultRef = 'Ubicación exacta de la base final';
    } else {
      defaultName = `Parada intermedia ${paradas.length}`;
      defaultRef = 'Calle, esquina o punto de referencia';
    }

    setParadas((prev) => [
      ...prev,
      {
        nombre: defaultName,
        referencia: defaultRef,
        lat: Number(latlng.lat.toFixed(6)),
        lng: Number(latlng.lng.toFixed(6))
      }
    ]);
  };

  const handleUpdateStopName = (index, newName) => {
    setParadas((prev) => {
      const updated = [...prev];
      updated[index].nombre = newName;
      return updated;
    });
  };

  const handleUpdateStopRef = (index, newRef) => {
    setParadas((prev) => {
      const updated = [...prev];
      updated[index].referencia = newRef;
      return updated;
    });
  };

  const handleRemoveStop = (index) => {
    setParadas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllStops = () => {
    setParadas([]);
  };

  const handleReverseRoute = () => {
    setParadas((prev) => [...prev].reverse());
  };

  const handleStartEditRoute = (ruta) => {
    setEditingRouteId(ruta.id);
    setNumero(ruta.numero || '');
    setNombre(ruta.nombre || '');
    setColorHex(ruta.color || ruta.colorHex || '#2F5233');
    setPrecioEstimado(
      ruta.precio !== undefined
        ? String(ruta.precio)
        : ruta.precioEstimado
        ? String(ruta.precioEstimado)
        : '10.00'
    );
    setDuracionMin(String(ruta.duracionMin || '20'));
    if (Array.isArray(ruta.paradas)) {
      setParadas(
        ruta.paradas.map((p) => ({
          nombre: p.nombre || '',
          referencia: p.referencia || '',
          lat: Number(p.lat),
          lng: Number(p.lng)
        }))
      );
    } else {
      setParadas([]);
    }
    setFeedbackMsg(null);
    setActiveTab('create');
  };

  const handleCancelEdit = () => {
    setEditingRouteId(null);
    setNumero('');
    setNombre('');
    setColorHex('#2F5233');
    setPrecioEstimado('10.00');
    setDuracionMin('20');
    setParadas([]);
    setFeedbackMsg(null);
    setActiveTab('list');
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();
    if (!numero.trim() || !nombre.trim()) {
      setFeedbackMsg({ type: 'error', text: 'El número y nombre de la ruta son obligatorios.' });
      return;
    }
    if (paradas.length < 2) {
      setFeedbackMsg({ type: 'error', text: 'Haz clic en el mapa para marcar al menos 2 puntos (Base de Origen y Base de Destino).' });
      return;
    }

    setIsSaving(true);
    setFeedbackMsg(null);

    try {
      const routePayload = {
        numero: numero.trim(),
        nombre: nombre.trim(),
        colorHex,
        precioEstimado: parseFloat(precioEstimado),
        duracionMin: parseInt(duracionMin, 10),
        activa: true,
        paradas: paradas.map((p, idx) => ({
          nombre: p.nombre.trim(),
          referencia: p.referencia ? p.referencia.trim() : '',
          lat: p.lat,
          lng: p.lng,
          orden: idx + 1
        }))
      };

      if (editingRouteId) {
        await actualizarRuta(editingRouteId, routePayload);
        setFeedbackMsg({ type: 'success', text: `¡Ruta ${numero} actualizada exitosamente!` });
      } else {
        await crearRuta(routePayload);
        setFeedbackMsg({ type: 'success', text: `¡Ruta ${numero} creada y publicada exitosamente!` });
      }

      if (onRouteCreated) onRouteCreated();

      setTimeout(() => {
        setEditingRouteId(null);
        setNumero('');
        setNombre('');
        setParadas([]);
        setActiveTab('list');
        setFeedbackMsg(null);
      }, 1200);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Error al guardar los cambios de la ruta.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRoute = async (id, num) => {
    if (!window.confirm(`¿Estás seguro de eliminar la Ruta ${num}?`)) return;
    try {
      await eliminarRuta(id);
      if (onRouteDeleted) onRouteDeleted();
    } catch (err) {
      alert('Error al eliminar la ruta.');
    }
  };

  const handleSuggestionStatus = async (id, newStatus) => {
    try {
      await cambiarEstadoSugerencia(id, newStatus);
      loadSuggestions();
    } catch (e) {
      alert('Error al actualizar sugerencia.');
    }
  };

  const handlePublishSuggestedRoute = async (sugId) => {
    try {
      const res = await aprobarYPublicarRutaSugerida(sugId);
      if (onRouteCreated) onRouteCreated();
      loadSuggestions();

      const goExplora = window.confirm(
        '¡Ruta aprobada y agregada al sistema con éxito!\n\n¿Deseas volver al Explorador ahora para verla en el mapa?'
      );
      if (goExplora) {
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert('Error al publicar la ruta sugerida.');
    }
  };

  const pendingCount = suggestions.filter((s) => s.estado === 'PENDIENTE').length;

  return (
    <div className="admin-container">
      {/* Top Admin Navigation Bar */}
      <div className="admin-navbar">
        <div className="admin-title-area">
          <button type="button" className="btn-back-home" onClick={onClose}>
            <ArrowLeft size={16} />
            <span>Volver al Explorador</span>
          </button>
          <div className="admin-heading">
            <h2>Panel de Control del Administrador</h2>
            <span className="admin-badge">Gestión Central</span>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            <Layers size={16} />
            <span>Rutas Publicadas ({rutas.length})</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => {
              if (!editingRouteId) {
                setNumero('');
                setNombre('');
                setParadas([]);
              }
              setActiveTab('create');
            }}
          >
            {editingRouteId ? <Edit3 size={16} /> : <Plus size={16} />}
            <span>{editingRouteId ? `Editando Ruta (${numero || 'Seleccionada'})` : 'Diseñar Nueva Ruta'}</span>
          </button>

          <button
            type="button"
            className={`admin-tab-btn ${activeTab === 'suggestions' ? 'active' : ''}`}
            onClick={() => setActiveTab('suggestions')}
          >
            <MessageSquare size={16} />
            <span>Buzón Ciudadano</span>
            {pendingCount > 0 && <span className="tab-pill-badge">{pendingCount}</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="admin-content">
        {/* TAB 1: LISTADO DE RUTAS */}
        {activeTab === 'list' && (
          <div className="admin-section">
            <div className="section-toolbar">
              <div>
                <h3 className="admin-section-title">Rutas Publicadas en el Explorador</h3>
                <p className="admin-section-subtitle">Estas rutas son visibles inmediatamente para todos los pasajeros en el mapa</p>
              </div>
            </div>

            <div className="admin-table-card">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th>Ruta</th>
                    <th>Nombre / Recorrido</th>
                    <th>Tarifa</th>
                    <th>Tiempo</th>
                    <th>Paradas</th>
                    <th>Calificación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rutas.map((ruta) => (
                    <tr key={ruta.id}>
                      <td>
                        <div className="table-route-badge" style={{ backgroundColor: ruta.color || '#2F5233' }}>
                          {ruta.numero}
                        </div>
                      </td>
                      <td>
                        <strong className="route-table-title">{ruta.nombre}</strong>
                        <div className="route-table-sub">
                          {ruta.origen || ruta.paradas?.[0]?.nombre} ➔ {ruta.destino || ruta.paradas?.[ruta.paradas.length - 1]?.nombre}
                        </div>
                      </td>
                      <td>
                        <span className="price-tag">${Number(ruta.precio !== undefined ? ruta.precio : ruta.precioEstimado || 10).toFixed(2)} MXN</span>
                      </td>
                      <td>{ruta.duracionMin} min</td>
                      <td>
                        <span className="stops-count-tag">
                          <MapPin size={12} /> {ruta.paradas?.length || 0} paradas / bases
                        </span>
                      </td>
                      <td>
                        <span className="table-star-score">
                          ⭐ {ruta.calificacionPromedio || '4.7'} ({ruta.totalCalificaciones || 0})
                        </span>
                      </td>
                      <td>
                        <div className="table-action-btns">
                          <button
                            type="button"
                            className="btn-action-edit"
                            title="Editar precio, nombre, paradas y re-trazar en el mapa"
                            onClick={() => handleStartEditRoute(ruta)}
                          >
                            <Edit3 size={15} />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            className="btn-action-delete"
                            title="Eliminar ruta"
                            onClick={() => handleDeleteRoute(ruta.id, ruta.numero)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CREADOR Y DISEÑADOR DE RUTAS CON MAPA */}
        {activeTab === 'create' && (
          <div className="route-designer-layout">
            <div className="designer-form-card">
              <div className="designer-form-header">
                <div>
                  <h3 className="designer-title">
                    {editingRouteId ? `Editar Ruta: ${numero}` : 'Configuración de la Ruta'}
                  </h3>
                  <p className="designer-desc">
                    {editingRouteId
                      ? 'Modifica los precios, datos o re-define los puntos y paradas en el mapa haciendo clic.'
                      : 'Pon los datos de la combi y haz clic en el mapa para colocar la Base de Salida, paradas intermedias y la Base de Llegada.'}
                  </p>
                </div>
                {editingRouteId && (
                  <button
                    type="button"
                    className="btn-cancel-edit"
                    onClick={handleCancelEdit}
                  >
                    <span>Cancelar edición</span>
                  </button>
                )}
              </div>

              {feedbackMsg && (
                <div className={`form-alert ${feedbackMsg.type}`}>
                  <AlertCircle size={16} />
                  <span>{feedbackMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveRoute}>
                <div className="designer-form-body">
                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label className="form-label">Número o Letra de Ruta *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ej. Texcalac, 08, 14-A"
                        value={numero}
                        onChange={(e) => setNumero(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label className="form-label">Color identificador</label>
                      <div className="color-picker-row">
                        {COLOR_PALETTE.map((col) => (
                          <button
                            type="button"
                            key={col}
                            className={`color-dot-btn ${colorHex === col ? 'selected' : ''}`}
                            style={{ backgroundColor: col }}
                            onClick={() => setColorHex(col)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Nombre descriptivo del recorrido *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. Texcalac - Apizaco Centro por Boulevard"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label className="form-label">Pasaje / Tarifa ($ MXN) *</label>
                      <input
                        type="number"
                        step="0.50"
                        min="1"
                        className="form-input"
                        value={precioEstimado}
                        onChange={(e) => setPrecioEstimado(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label className="form-label">Duración aprox. (minutos) *</label>
                      <input
                        type="number"
                        min="5"
                        className="form-input"
                        value={duracionMin}
                        onChange={(e) => setDuracionMin(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Stops Editor */}
                  <div className="stops-editor-section">
                    <div className="stops-editor-header">
                      <div>
                        <h4>Paradas y Bases ({paradas.length})</h4>
                        <span className="hint-text">
                          {paradas.length === 0
                            ? '👉 Haz 1er clic en el mapa para fijar la Base de Origen'
                            : paradas.length === 1
                            ? '👉 Haz 2do clic para fijar la Base de Destino'
                            : '👉 Clics adicionales añaden paradas intermedias'}
                        </span>
                      </div>

                      {paradas.length > 0 && (
                        <div className="stops-actions-top">
                          {paradas.length >= 2 && (
                            <button
                              type="button"
                              className="btn-text-action"
                              onClick={handleReverseRoute}
                              title="Invertir sentido de la ruta"
                            >
                              <ArrowUpDown size={13} />
                              <span>Invertir</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn-text-action danger"
                            onClick={handleClearAllStops}
                            title="Borrar todos los puntos y empezar de nuevo"
                          >
                            <RotateCcw size={13} />
                            <span>Limpiar</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {paradas.length === 0 ? (
                      <div className="empty-stops-prompt">
                        <MapPin size={24} className="prompt-pin-icon" />
                        <p>El mapa está en blanco. Haz clic donde inicia la ruta (ej. en Texcalac o cualquier municipio) para marcar su base.</p>
                      </div>
                    ) : (
                      <div className="stops-edit-list">
                        {paradas.map((parada, idx) => {
                          const isFirst = idx === 0;
                          const isLast = idx === paradas.length - 1 && paradas.length > 1;

                          return (
                            <div key={idx} className={`stop-edit-item ${isFirst ? 'is-origin' : isLast ? 'is-dest' : ''}`}>
                              <div className="stop-item-header">
                                <span
                                  className="stop-badge-num"
                                  style={{ backgroundColor: isFirst ? '#10b981' : isLast ? '#ef4444' : colorHex }}
                                >
                                  {isFirst ? 'ORIGEN' : isLast ? 'DESTINO' : `${idx + 1}`}
                                </span>

                                <span className="stop-coord-pill">
                                  {parada.lat.toFixed(4)}, {parada.lng.toFixed(4)}
                                </span>

                                <button
                                  type="button"
                                  className="btn-remove-stop"
                                  onClick={() => handleRemoveStop(idx)}
                                  title="Quitar este punto"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              <div className="stop-inputs-grid">
                                <input
                                  type="text"
                                  className="stop-name-input"
                                  value={parada.nombre}
                                  onChange={(e) => handleUpdateStopName(idx, e.target.value)}
                                  placeholder={isFirst ? 'Nombre de la Base de Salida (ej. Base Texcalac)' : isLast ? 'Nombre de la Base de Llegada (ej. Base Apizaco)' : 'Nombre de la parada...'}
                                />
                                <input
                                  type="text"
                                  className="stop-ref-input"
                                  value={parada.referencia || ''}
                                  onChange={(e) => handleUpdateStopRef(idx, e.target.value)}
                                  placeholder="📍 Ubicación exacta / Calle / Esquina (ej. Calle Hidalgo frente a la parroquia)"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="designer-footer">
                  <button
                    type="submit"
                    className="btn-submit-route"
                    disabled={isSaving || paradas.length < 2}
                  >
                    <Save size={16} />
                    <span>{isSaving ? 'Guardando...' : 'Guardar y Publicar Ruta'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Map Canvas */}
            <div className="designer-map-container">
              <div className="map-instruction-banner">
                <MapPin size={16} />
                <span>
                  {paradas.length === 0
                    ? 'Haz clic sobre el mapa para colocar el punto exacto de la primera base.'
                    : `Llevas ${paradas.length} ${paradas.length === 1 ? 'punto marcado' : 'puntos marcados'}. Haz clic para agregar el siguiente.`}
                </span>
              </div>

              <MapContainer
                center={APIZACO_CENTER}
                zoom={13}
                scrollWheelZoom={true}
                className="designer-leaflet-canvas"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <MapClickHandler onMapClick={handleMapClick} />

                {paradas.length >= 2 && (
                  <Polyline
                    positions={paradas.map((p) => [p.lat, p.lng])}
                    pathOptions={{
                      color: colorHex,
                      weight: 5,
                      dashArray: '6, 6',
                      lineCap: 'round'
                    }}
                  />
                )}

                {paradas.map((parada, idx) => (
                  <Marker
                    key={`designer-p-${idx}`}
                    position={[parada.lat, parada.lng]}
                    icon={createDesignerMarkerIcon(idx, paradas.length, colorHex)}
                  >
                    <Popup>
                      <div className="designer-popup">
                        <strong>{idx === 0 ? '🟢 Base de Origen' : idx === paradas.length - 1 ? '🔴 Base de Destino' : `Parada #${idx + 1}`}</strong>
                        <h4>{parada.nombre}</h4>
                        {parada.referencia && <p className="popup-ref-note">📍 {parada.referencia}</p>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* TAB 3: BUZÓN DE SUGERENCIAS */}
        {activeTab === 'suggestions' && (
          <div className="admin-section">
            <div className="section-toolbar">
              <div>
                <h3 className="admin-section-title">Bandeja de Aportes Ciudadanos</h3>
                <p className="admin-section-subtitle">Revisa las propuestas de los pasajeros y pulsa "Aprobar y Publicar" para añadirlas al explorador oficial</p>
              </div>

              <div className="filter-pill-group">
                {['TODAS', 'PENDIENTE', 'APROBADA', 'RECHAZADA'].map((f) => (
                  <button
                    type="button"
                    key={f}
                    className={`filter-pill-btn ${suggestionFilter === f ? 'active' : ''}`}
                    onClick={() => setSuggestionFilter(f)}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="suggestions-grid">
              {[...suggestions]
                .filter((s) => suggestionFilter === 'TODAS' || s.estado === suggestionFilter)
                .sort((a, b) => {
                  const timeA = new Date(a.fechaCreacion || 0).getTime();
                  const timeB = new Date(b.fechaCreacion || 0).getTime();

                  if (suggestionFilter === 'PENDIENTE') {
                    // En la pestaña PENDIENTE: Lo más viejo primero (prioridad de revisión FIFO)
                    return timeA - timeB;
                  }

                  if (suggestionFilter === 'TODAS') {
                    // En TODAS: Primero las PENDIENTES arriba, y entre ellas las más recientes
                    if (a.estado === 'PENDIENTE' && b.estado !== 'PENDIENTE') return -1;
                    if (a.estado !== 'PENDIENTE' && b.estado === 'PENDIENTE') return 1;
                    return timeB - timeA;
                  }

                  // Para APROBADA y RECHAZADA: Más recientes primero
                  return timeB - timeA;
                })
                .map((sug) => {
                  let parsedRoute = null;
                  if (sug.datosRutaJson) {
                    try {
                      parsedRoute = JSON.parse(sug.datosRutaJson);
                    } catch (e) {}
                  }

                  return (
                    <div key={sug.id} className={`suggestion-card status-${sug.estado.toLowerCase()}`}>
                      <div className="sug-card-header">
                        <span className={`sug-status-badge ${sug.estado.toLowerCase()}`}>
                          {sug.estado}
                        </span>
                        <span className="sug-date">
                          {new Date(sug.fechaCreacion).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="sug-title">{sug.titulo}</h4>
                      <p className="sug-desc">{sug.descripcion}</p>

                      {parsedRoute && (
                        <div className="sug-route-preview-badge">
                          <div className="sug-preview-title">
                            <Navigation size={13} />
                            <span>Ruta propuesta: <strong>{parsedRoute.numero} - {parsedRoute.nombre}</strong></span>
                          </div>
                          <div className="sug-preview-details">
                            <span>💵 Pasaje: <strong>${parsedRoute.precioEstimado} MXN</strong></span>
                            <span>⏱️ <strong>{parsedRoute.duracionMin} min</strong></span>
                            <span>📍 <strong>{parsedRoute.paradas?.length || 0} paradas / bases marcadas</strong></span>
                          </div>
                          {parsedRoute.paradas?.[0]?.referencia && (
                            <div className="sug-base-ref-note">
                              <span>📍 Base Origen: <em>{parsedRoute.paradas[0].nombre} ({parsedRoute.paradas[0].referencia})</em></span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="sug-meta-row">
                        {sug.rutaReferencia && (
                          <span className="sug-meta-item">
                            <strong>Combi:</strong> {sug.rutaReferencia}
                          </span>
                        )}
                        {sug.nombreContacto && (
                          <span className="sug-meta-item">
                            <strong>Aporte de:</strong> {sug.nombreContacto}
                          </span>
                        )}
                      </div>

                      <div className="sug-actions">
                        {sug.estado === 'PENDIENTE' ? (
                          <>
                            <button
                              type="button"
                              className="btn-sug-publish-route"
                              onClick={() => handlePublishSuggestedRoute(sug.id)}
                              title="Convertir esta sugerencia en una ruta oficial activa en el explorador"
                            >
                              <Sparkles size={14} />
                              <span>✨ Aprobar y Publicar en Explorador</span>
                            </button>

                            <button
                              type="button"
                              className="btn-sug-reject"
                              onClick={() => handleSuggestionStatus(sug.id, 'RECHAZADA')}
                            >
                              <XCircle size={14} />
                              <span>Descartar</span>
                            </button>
                          </>
                        ) : sug.estado === 'APROBADA' ? (
                          <div className="sug-published-badge">
                            <CheckCircle size={15} />
                            <span>Ruta Aprobada y Publicada en el Mapa</span>
                          </div>
                        ) : (
                          <div className="sug-rejected-badge">
                            <XCircle size={15} />
                            <span>Sugerencia Descartada</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
