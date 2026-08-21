import React, { useState, useEffect } from 'react';
import {
  X, Send, CheckCircle2, AlertCircle, MessageSquarePlus, DollarSign,
  MapPin, Bus, Map as MapIcon, Plus, Trash2, Navigation, Clock, RotateCcw, ArrowUpDown
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { enviarSugerencia } from '../services/api';

const APIZACO_CENTER = [19.4128, -98.1428];

function MapResizer({ trigger, stops }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 50);
    const t2 = setTimeout(() => map.invalidateSize(), 200);
    const t3 = setTimeout(() => map.invalidateSize(), 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map, trigger]);

  useEffect(() => {
    if (stops && stops.length >= 2) {
      try {
        const bounds = L.latLngBounds(stops.map(s => [s.lat, s.lng]));
        map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
      } catch (e) {
        // ignore
      }
    }
  }, [stops, map]);

  return null;
}

function MiniMapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    }
  });
  return null;
}

function createCitizenPin(index, total) {
  const isFirst = index === 0;
  const isLast = index === total - 1 && total > 1;
  const bgColor = isFirst ? '#10b981' : isLast ? '#ef4444' : '#2563eb';
  const label = isFirst ? 'Origen' : isLast ? 'Destino' : `${index + 1}`;

  const html = `
    <div class="custom-map-marker-pin citizen-mini-pin" style="--pin-color: ${bgColor}">
      <div class="marker-bubble">
        <span class="marker-seq">${isFirst ? 'A' : isLast ? 'B' : index + 1}</span>
      </div>
      <div class="marker-label-tag visible">${label}</div>
    </div>
  `;
  return L.divIcon({
    className: 'custom-div-icon',
    html,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -32]
  });
}

export default function SuggestModal({ isOpen, onClose, onSubmitted }) {
  const [activeMode, setActiveMode] = useState('MAP_ROUTE');
  const [mobileSubTab, setMobileSubTab] = useState('FORM'); // 'FORM' | 'MAP'

  // Quick report state
  const [tipo, setTipo] = useState('CAMBIO_TARIFA');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [rutaReferencia, setRutaReferencia] = useState('');
  const [nombreContacto, setNombreContacto] = useState('');

  // Map Route tracer state
  const [numeroRuta, setNumeroRuta] = useState('');
  const [nombreRuta, setNombreRuta] = useState('');
  const [precioPasaje, setPrecioPasaje] = useState('11.00');
  const [duracionAprox, setDuracionAprox] = useState('20');
  const [paradasTrazadas, setParadasTrazadas] = useState([]); // Start empty for total freedom!

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleMapClick = (latlng) => {
    let defaultName = '';
    let defaultRef = '';

    if (paradasTrazadas.length === 0) {
      defaultName = 'Base de Salida / Origen';
      defaultRef = 'Ubicación exacta o calle de la base';
    } else if (paradasTrazadas.length === 1) {
      defaultName = 'Base de Llegada / Destino';
      defaultRef = 'Ubicación exacta o calle de la base';
    } else {
      defaultName = `Parada #${paradasTrazadas.length + 1}`;
      defaultRef = 'Calle, esquina o punto de referencia';
    }

    setParadasTrazadas((prev) => [
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
    setParadasTrazadas((prev) => {
      const updated = [...prev];
      updated[index].nombre = newName;
      return updated;
    });
  };

  const handleUpdateStopRef = (index, newRef) => {
    setParadasTrazadas((prev) => {
      const updated = [...prev];
      updated[index].referencia = newRef;
      return updated;
    });
  };

  const handleRemoveStop = (index) => {
    setParadasTrazadas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearStops = () => {
    setParadasTrazadas([]);
  };

  const handleReverseRoute = () => {
    setParadasTrazadas((prev) => [...prev].reverse());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (activeMode === 'MAP_ROUTE') {
        if (!nombreRuta.trim() || !numeroRuta.trim()) {
          setErrorMsg('Por favor completa el número y nombre del recorrido de la combi.');
          setIsSubmitting(false);
          return;
        }
        if (paradasTrazadas.length < 2) {
          setErrorMsg('Haz clic en el mapa para marcar al menos la Base de Salida y la Base de Llegada.');
          setIsSubmitting(false);
          return;
        }

        const routeDataPayload = {
          numero: numeroRuta.trim(),
          nombre: nombreRuta.trim(),
          colorHex: '#2F5233',
          precioEstimado: parseFloat(precioPasaje) || 10.0,
          duracionMin: parseInt(duracionAprox, 10) || 20,
          paradas: paradasTrazadas.map((p, idx) => ({
            nombre: p.nombre.trim(),
            referencia: p.referencia ? p.referencia.trim() : '',
            lat: p.lat,
            lng: p.lng,
            orden: idx + 1
          }))
        };

        await enviarSugerencia({
          tipo: 'NUEVA_RUTA_MAPA',
          titulo: `Propuesta de Ruta ${numeroRuta}: ${nombreRuta}`,
          descripcion: `Ruta propuesta por la comunidad con tarifa de $${precioPasaje} MXN, duración de ${duracionAprox} min y ${paradasTrazadas.length} paradas/bases marcadas.`,
          rutaReferencia: numeroRuta.trim(),
          nombreContacto: nombreContacto.trim() || 'Pasajero de Apizaco',
          datosRutaJson: JSON.stringify(routeDataPayload)
        });
      } else {
        if (!titulo.trim() || !descripcion.trim()) {
          setErrorMsg('Por favor completa el título y los detalles de tu reporte.');
          setIsSubmitting(false);
          return;
        }

        await enviarSugerencia({
          tipo,
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          rutaReferencia: rutaReferencia.trim(),
          nombreContacto: nombreContacto.trim()
        });
      }

      setIsSuccess(true);
      if (onSubmitted) onSubmitted();

      setTimeout(() => {
        setIsSuccess(false);
        setTitulo('');
        setDescripcion('');
        setNumeroRuta('');
        setNombreRuta('');
        setParadasTrazadas([]);
        onClose();
      }, 2200);
    } catch (err) {
      setErrorMsg('No se pudo enviar la propuesta. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-card ${activeMode === 'MAP_ROUTE' ? 'modal-card-wide' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Bus size={20} />
            </div>
            <div>
              <h3 className="modal-title">Aportes Ciudadanos de Transporte</h3>
              <p className="modal-subtitle">Propón nuevas combis o avisa sobre tarifas actualizadas</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="modal-mode-tabs">
          <button
            type="button"
            className={`mode-tab-btn ${activeMode === 'MAP_ROUTE' ? 'active' : ''}`}
            onClick={() => setActiveMode('MAP_ROUTE')}
          >
            <MapIcon size={15} />
            <span>Trazar Nueva Ruta y Bases en Mini-Mapa</span>
          </button>

          <button
            type="button"
            className={`mode-tab-btn ${activeMode === 'QUICK_REPORT' ? 'active' : ''}`}
            onClick={() => setActiveMode('QUICK_REPORT')}
          >
            <MessageSquarePlus size={15} />
            <span>Reportar Cambio de Tarifa / Aviso</span>
          </button>
        </div>

        {isSuccess ? (
          <div className="modal-success-state">
            <CheckCircle2 size={52} className="success-icon" />
            <h4>¡Muchas gracias por tu aporte ciudadano!</h4>
            <p>
              {activeMode === 'MAP_ROUTE'
                ? 'Tu ruta y bases han sido enviadas al administrador. En cuanto sea validada, se publicará en el mapa oficial.'
                : 'Tu reporte de tarifa ha sido enviado a moderación con éxito.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            {errorMsg && (
              <div className="form-alert error">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* MODE 1: TRACE ROUTE & BASES ON MINI MAP */}
            {activeMode === 'MAP_ROUTE' ? (
              <>
                {/* Mobile Sub-Navigation Tabs */}
                <div className="citizen-mobile-subnav">
                  <button
                    type="button"
                    className={`btn-subnav-pill ${mobileSubTab === 'FORM' ? 'active' : ''}`}
                    onClick={() => setMobileSubTab('FORM')}
                  >
                    <Bus size={14} />
                    <span>1. Datos de la Combi</span>
                  </button>
                  <button
                    type="button"
                    className={`btn-subnav-pill ${mobileSubTab === 'MAP' ? 'active' : ''}`}
                    onClick={() => setMobileSubTab('MAP')}
                  >
                    <MapPin size={14} />
                    <span>2. Marcar en Mapa ({paradasTrazadas.length})</span>
                  </button>
                </div>

                <div className="citizen-route-grid">
                  {/* Left Side: Form Info */}
                  <div className={`citizen-form-col ${mobileSubTab === 'FORM' ? 'mob-show' : 'mob-hide'}`}>
                    <div className="form-row">
                      <div className="form-group flex-1">
                        <label className="form-label">Número o Letra de Combi *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ej. Texcalac, 16, San Cosme"
                          value={numeroRuta}
                          onChange={(e) => setNumeroRuta(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group flex-1">
                        <label className="form-label">Costo Pasaje ($ MXN) *</label>
                        <input
                          type="number"
                          step="0.50"
                          min="1"
                          className="form-input"
                          value={precioPasaje}
                          onChange={(e) => setPrecioPasaje(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Nombre del Recorrido *</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ej. Texcalac - Apizaco Centro por Carretera Federal"
                        value={nombreRuta}
                        onChange={(e) => setNombreRuta(e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group flex-1">
                        <label className="form-label">Tiempo Aprox (Minutos)</label>
                        <input
                          type="number"
                          min="5"
                          className="form-input"
                          value={duracionAprox}
                          onChange={(e) => setDuracionAprox(e.target.value)}
                        />
                      </div>

                      <div className="form-group flex-1">
                        <label className="form-label">Tu Nombre o Alias</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Ej. Vecino de Texcalac"
                          value={nombreContacto}
                          onChange={(e) => setNombreContacto(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Stops List */}
                    <div className="citizen-stops-box">
                      <div className="citizen-stops-title">
                        <div>
                          <span>Bases y Paradas ({paradasTrazadas.length})</span>
                        </div>

                        {paradasTrazadas.length > 0 && (
                          <div className="citizen-stops-actions">
                            {paradasTrazadas.length >= 2 && (
                              <button
                                type="button"
                                className="btn-tiny-link"
                                onClick={handleReverseRoute}
                                title="Invertir sentido de salida y llegada"
                              >
                                <ArrowUpDown size={12} />
                                <span>Invertir</span>
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn-tiny-link danger"
                              onClick={handleClearStops}
                              title="Borrar puntos y empezar de nuevo"
                            >
                              <RotateCcw size={12} />
                              <span>Limpiar</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {paradasTrazadas.length === 0 ? (
                        <div className="empty-stops-prompt mini">
                          <MapPin size={18} />
                          <p>Haz clic o toca en el mapa donde inicia la combi (su primera base).</p>
                        </div>
                      ) : (
                        <div className="citizen-stops-scroll">
                          {paradasTrazadas.map((p, idx) => {
                            const isFirst = idx === 0;
                            const isLast = idx === paradasTrazadas.length - 1 && paradasTrazadas.length > 1;

                            return (
                              <div key={idx} className={`citizen-stop-row ${isFirst ? 'is-start' : isLast ? 'is-end' : ''}`}>
                                <div className="stop-row-top">
                                  <span className={`citizen-stop-badge ${isFirst ? 'start' : isLast ? 'end' : ''}`}>
                                    {isFirst ? 'ORIGEN / BASE' : isLast ? 'DESTINO / BASE' : `PARADA ${idx + 1}`}
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

                                <input
                                  type="text"
                                  className="citizen-stop-input bold"
                                  value={p.nombre}
                                  onChange={(e) => handleUpdateStopName(idx, e.target.value)}
                                  placeholder={isFirst ? 'Nombre de la Base de Salida' : isLast ? 'Nombre de la Base de Llegada' : 'Nombre de la parada...'}
                                />
                                <input
                                  type="text"
                                  className="citizen-stop-ref-input"
                                  value={p.referencia || ''}
                                  onChange={(e) => handleUpdateStopRef(idx, e.target.value)}
                                  placeholder="📍 Calle o referencia exacta"
                                />
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Mobile Button to jump to Map */}
                    <button
                      type="button"
                      className="btn-next-step-map mob-only"
                      onClick={() => setMobileSubTab('MAP')}
                    >
                      <MapIcon size={16} />
                      <span>Ir al Mapa para trazar puntos ({paradasTrazadas.length}) ➔</span>
                    </button>
                  </div>

                  {/* Right Side: Interactive Mini Map */}
                  <div className={`citizen-minimap-col ${mobileSubTab === 'MAP' ? 'mob-show' : 'mob-hide'}`}>
                    <div className="minimap-banner">
                      <Navigation size={14} />
                      <span>
                        {paradasTrazadas.length === 0
                          ? 'Toca en el mapa para fijar la base de salida.'
                          : `Llevas ${paradasTrazadas.length} puntos. Toca para añadir la siguiente parada.`}
                      </span>
                    </div>

                    <div className="minimap-container">
                      <MapContainer
                        center={APIZACO_CENTER}
                        zoom={13}
                        scrollWheelZoom={true}
                        className="citizen-leaflet-canvas"
                      >
                        <MapResizer trigger={`${mobileSubTab}-${activeMode}-${isOpen}-${paradasTrazadas.length}`} stops={paradasTrazadas} />
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        />
                        <MiniMapClickHandler onMapClick={handleMapClick} />

                        {paradasTrazadas.length >= 2 && (
                          <Polyline
                            positions={paradasTrazadas.map((p) => [p.lat, p.lng])}
                            pathOptions={{
                              color: '#2563eb',
                              weight: 5,
                              dashArray: '5, 5',
                              lineCap: 'round'
                            }}
                          />
                        )}

                        {paradasTrazadas.map((p, idx) => (
                          <Marker
                            key={`cit-p-${idx}`}
                            position={[p.lat, p.lng]}
                            icon={createCitizenPin(idx, paradasTrazadas.length)}
                          >
                            <Popup>
                              <div className="citizen-popup">
                                <strong>{idx === 0 ? '🟢 Base de Origen' : idx === paradasTrazadas.length - 1 ? '🔴 Base de Destino' : `Parada #${idx + 1}`}</strong>
                                <h4>{p.nombre}</h4>
                                {p.referencia && <p className="popup-ref-note">📍 {p.referencia}</p>}
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                      </MapContainer>
                    </div>

                    <div className="mob-back-to-form-row mob-only">
                      <button
                        type="button"
                        className="btn-prev-step-form"
                        onClick={() => setMobileSubTab('FORM')}
                      >
                        ⬅️ Volver a Datos
                      </button>
                      <span className="mob-stops-counter-tag">
                        📍 {paradasTrazadas.length} {paradasTrazadas.length === 1 ? 'punto marcado' : 'puntos marcados'}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* MODE 2: QUICK FARE / NOTICE REPORT */
              <div className="quick-report-grid">
                <div className="form-group">
                  <label className="form-label">Tipo de reporte</label>
                  <div className="report-type-chips">
                    <button
                      type="button"
                      className={`type-chip ${tipo === 'CAMBIO_TARIFA' ? 'active' : ''}`}
                      onClick={() => setTipo('CAMBIO_TARIFA')}
                    >
                      <DollarSign size={14} />
                      <span>Cambio de Pasaje</span>
                    </button>
                    <button
                      type="button"
                      className={`type-chip ${tipo === 'NUEVA_RUTA' ? 'active' : ''}`}
                      onClick={() => setTipo('NUEVA_RUTA')}
                    >
                      <Bus size={14} />
                      <span>Nueva Combi / Ramal</span>
                    </button>
                    <button
                      type="button"
                      className={`type-chip ${tipo === 'MODIFICAR_PARADAS' ? 'active' : ''}`}
                      onClick={() => setTipo('MODIFICAR_PARADAS')}
                    >
                      <MapPin size={14} />
                      <span>Nueva Parada / Desvío</span>
                    </button>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group flex-1">
                    <label className="form-label">Ruta o Combi (Opcional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. Ruta Texcalac, 07, Flecha Azul"
                      value={rutaReferencia}
                      onChange={(e) => setRutaReferencia(e.target.value)}
                    />
                  </div>

                  <div className="form-group flex-1">
                    <label className="form-label">Tu Nombre o Alias (Opcional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ej. Pasajero Diario"
                      value={nombreContacto}
                      onChange={(e) => setNombreContacto(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Título del reporte *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej. La combi a Tetla subió a $12.00 pesos"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Detalles / Explicación *</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="Explica qué cambió, nuevas calles o paradas..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting || (activeMode === 'MAP_ROUTE' && paradasTrazadas.length < 2)}
              >
                <Send size={16} />
                <span>
                  {isSubmitting
                    ? 'Enviando propuesta...'
                    : activeMode === 'MAP_ROUTE'
                    ? 'Enviar Ruta para Publicación'
                    : 'Enviar Reporte'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
