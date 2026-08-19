import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, MapPin, Navigation, Info } from 'lucide-react';

const APIZACO_CENTER = [19.4128, -98.1428];

function MapBoundsUpdater({ points }) {
  const map = useMap();

  useEffect(() => {
    // Invalidate map size so Leaflet recalculates tile grid when tab/viewport changes
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 150);
    const t2 = setTimeout(() => map.invalidateSize(), 400);

    if (!points || points.length === 0) {
      map.setView(APIZACO_CENTER, 12, { animate: true });
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
      animate: true
    });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [points, map]);

  useEffect(() => {
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [map]);

  return null;
}

function createCustomMarkerIcon(index, total, color, stopName) {
  const isFirst = index === 0;
  const isLast = index === total - 1 && total > 1;
  const badgeText = isFirst ? 'BASE SALIDA' : isLast ? 'BASE LLEGADA' : `${index + 1}`;
  const bgColor = isFirst ? '#10b981' : isLast ? '#ef4444' : (color || '#2F5233');

  const html = `
    <div class="custom-map-marker-pin" style="--pin-color: ${bgColor}">
      <div class="marker-bubble">
        <span class="marker-seq">${isFirst ? 'A' : isLast ? 'B' : index + 1}</span>
      </div>
      <div class="marker-pulse"></div>
      <div class="marker-label-tag">${stopName || badgeText}</div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-div-icon',
    html: html,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -36]
  });
}

export default function RouteMap({ selectedRoute, allRoutes = [] }) {
  const mapPoints = useMemo(() => {
    if (selectedRoute?.paradas?.length) {
      return selectedRoute.paradas.map((p) => ({
        lat: Number(p.lat),
        lng: Number(p.lng),
        nombre: p.nombre,
        referencia: p.referencia
      }));
    }

    const points = [];
    allRoutes.forEach((r) => {
      r.paradas?.forEach((p) => {
        points.push({
          lat: Number(p.lat),
          lng: Number(p.lng),
          nombre: p.nombre,
          referencia: p.referencia
        });
      });
    });
    return points;
  }, [selectedRoute, allRoutes]);

  const activeColor = selectedRoute?.color || '#2F5233';

  return (
    <div className="map-wrapper">
      <div className="map-floating-header">
        <div className="map-info-badge">
          <Layers size={15} />
          <span>
            {selectedRoute
              ? `Ruta ${selectedRoute.numero} • ${selectedRoute.paradas?.length || 0} paradas / bases`
              : 'Mostrando red general de transporte'}
          </span>
        </div>
      </div>

      <MapContainer
        center={APIZACO_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        className="leaflet-map-canvas"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapBoundsUpdater points={mapPoints} />

        {selectedRoute ? (
          <>
            {/* Background casing polyline */}
            <Polyline
              positions={selectedRoute.paradas.map((p) => [Number(p.lat), Number(p.lng)])}
              pathOptions={{
                color: '#ffffff',
                weight: 8,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            {/* Main colored route line */}
            <Polyline
              positions={selectedRoute.paradas.map((p) => [Number(p.lat), Number(p.lng)])}
              pathOptions={{
                color: activeColor,
                weight: 5,
                opacity: 0.95,
                dashArray: '8, 6',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />

            {/* Markers for stops and bases */}
            {selectedRoute.paradas.map((parada, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === selectedRoute.paradas.length - 1 && selectedRoute.paradas.length > 1;

              return (
                <Marker
                  key={`marker-${selectedRoute.id}-${idx}`}
                  position={[Number(parada.lat), Number(parada.lng)]}
                  icon={createCustomMarkerIcon(
                    idx,
                    selectedRoute.paradas.length,
                    activeColor,
                    parada.nombre
                  )}
                >
                  <Popup className="custom-leaflet-popup">
                    <div className="popup-content">
                      <div className="popup-header" style={{ borderLeftColor: isFirst ? '#10b981' : isLast ? '#ef4444' : activeColor }}>
                        <span className="popup-seq">
                          {isFirst ? '🟢 Base de Origen' : isLast ? '🔴 Base de Destino' : `Parada #${idx + 1}`}
                        </span>
                        <h4 className="popup-title">{parada.nombre}</h4>
                      </div>

                      <div className="popup-body">
                        {parada.referencia && (
                          <div className="popup-base-ref-box">
                            <MapPin size={13} className="ref-pin-icon" />
                            <span><strong>Ubicación exacta / Calle:</strong> {parada.referencia}</span>
                          </div>
                        )}
                        <p className="popup-route-name"><strong>Ruta {selectedRoute.numero}:</strong> {selectedRoute.nombre}</p>
                        <p className="popup-coords">
                          <Navigation size={12} /> {Number(parada.lat).toFixed(5)}, {Number(parada.lng).toFixed(5)}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        ) : (
          allRoutes.map((ruta) => {
            const coords = ruta.paradas?.map((p) => [Number(p.lat), Number(p.lng)]) || [];
            return (
              <React.Fragment key={`all-r-${ruta.id}`}>
                <Polyline
                  positions={coords}
                  pathOptions={{
                    color: ruta.color || '#2F5233',
                    weight: 3.5,
                    opacity: 0.65,
                    lineCap: 'round'
                  }}
                />
                {ruta.paradas?.map((p, idx) => (
                  <Marker
                    key={`all-p-${ruta.id}-${idx}`}
                    position={[Number(p.lat), Number(p.lng)]}
                    icon={createCustomMarkerIcon(
                      idx,
                      ruta.paradas.length,
                      ruta.color || '#2F5233',
                      p.nombre
                    )}
                  >
                    <Popup className="custom-leaflet-popup">
                      <div className="popup-content">
                        <span className="popup-seq">Ruta {ruta.numero} - {idx === 0 ? 'Base Salida' : idx === ruta.paradas.length - 1 ? 'Base Llegada' : `Parada #${idx + 1}`}</span>
                        <h4 className="popup-title">{p.nombre}</h4>
                        {p.referencia && (
                          <p className="popup-ref-note">📍 {p.referencia}</p>
                        )}
                        <p className="popup-coords">{Number(p.lat).toFixed(4)}, {Number(p.lng).toFixed(4)}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </React.Fragment>
            );
          })
        )}
      </MapContainer>
    </div>
  );
}
