import React, { useState } from 'react';
import {
  Clock, DollarSign, ChevronDown, ChevronUp, MapPin, Navigation,
  ArrowRight, Star, MessageSquare, User, Info
} from 'lucide-react';

export default function RouteCard({ ruta, isSelected, onSelect, onOpenRating }) {
  const [showStops, setShowStops] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  const routeColor = ruta.color || '#2F5233';
  const ratingScore = ruta.calificacionPromedio ? Number(ruta.calificacionPromedio).toFixed(1) : '4.7';
  const totalReviews = ruta.totalCalificaciones ?? (ruta.ultimasResenias?.length || 0);

  return (
    <article
      id={`route-card-${ruta.id}`}
      className={`route-ticket ${isSelected ? 'selected' : ''}`}
      style={{ '--route-color': routeColor }}
      onClick={() => onSelect(ruta)}
    >
      {/* Top Header */}
      <div className="ticket-header">
        <div className="ticket-badge" style={{ backgroundColor: routeColor }}>
          <span className="route-num-label">Ruta</span>
          <span className="route-num-val">{ruta.numero}</span>
        </div>

        <div className="ticket-main-info">
          <div className="ticket-title-row">
            <h3 className="route-title">{ruta.nombre}</h3>
            
            {/* Star Rating Badge */}
            <div className="route-star-badge" title="Puntuación promedio de los pasajeros">
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span className="star-score">{ratingScore}</span>
              <span className="star-count">({totalReviews})</span>
            </div>
          </div>

          <div className="route-endpoints">
            <span className="endpoint origin">
              <span className="dot origin-dot"></span>
              {ruta.origen || (ruta.paradas?.[0]?.nombre ?? 'Base Inicial')}
            </span>
            <ArrowRight size={14} className="endpoint-arrow" />
            <span className="endpoint destination">
              <span className="dot dest-dot"></span>
              {ruta.destino || (ruta.paradas?.[ruta.paradas.length - 1]?.nombre ?? 'Base Final')}
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Perforation Notch & Divider */}
      <div className="ticket-divider">
        <span className="notch notch-left"></span>
        <span className="dashed-line"></span>
        <span className="notch notch-right"></span>
      </div>

      {/* Ticket Meta Info */}
      <div className="ticket-body">
        <div className="meta-grid">
          <div className="meta-item">
            <DollarSign size={16} className="meta-icon price-icon" />
            <div>
              <span className="meta-label">Pasaje estimado</span>
              <span className="meta-value">${Number(ruta.precio).toFixed(2)} MXN</span>
            </div>
          </div>

          <div className="meta-item">
            <Clock size={16} className="meta-icon duration-icon" />
            <div>
              <span className="meta-label">Tiempo aprox.</span>
              <span className="meta-value">{ruta.duracionMin} min</span>
            </div>
          </div>

          <div className="meta-item">
            <MapPin size={16} className="meta-icon stops-icon" />
            <div>
              <span className="meta-label">Paradas y Bases</span>
              <span className="meta-value">{ruta.paradas?.length || 0} puntos</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="ticket-actions">
          <button
            type="button"
            className="btn-toggle-stops"
            onClick={(e) => {
              e.stopPropagation();
              setShowStops(!showStops);
            }}
          >
            <span>{showStops ? 'Ocultar paradas' : 'Ver paradas y bases'}</span>
            {showStops ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>

          <button
            type="button"
            className="btn-toggle-reviews"
            onClick={(e) => {
              e.stopPropagation();
              setShowReviews(!showReviews);
            }}
            title="Ver opiniones de otros usuarios"
          >
            <MessageSquare size={13} />
            <span>Opiniones</span>
          </button>

          <button
            type="button"
            className="btn-rate-route"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenRating) onOpenRating(ruta);
            }}
            title="Dejar una calificación en estrellas"
          >
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span>Calificar</span>
          </button>

          <button
            type="button"
            className={`btn-select-map ${isSelected ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(ruta);
            }}
          >
            <Navigation size={13} />
            <span>{isSelected ? 'En mapa' : 'Ver mapa'}</span>
          </button>
        </div>

        {/* Collapsible Stops Timeline with detailed street references */}
        {showStops && (
          <div className="stops-timeline">
            <h4 className="stops-heading">Itinerario y Ubicación de Bases</h4>
            <ol className="stops-list">
              {ruta.paradas?.map((parada, index) => {
                const isFirst = index === 0;
                const isLast = index === (ruta.paradas.length - 1) && ruta.paradas.length > 1;

                return (
                  <li key={`${ruta.id}-p-${index}`} className="stop-item">
                    <span
                      className={`stop-indicator ${isFirst ? 'first' : ''} ${isLast ? 'last' : ''}`}
                      style={{ borderColor: routeColor }}
                    >
                      {isFirst ? 'A' : isLast ? 'B' : index + 1}
                    </span>
                    <div className="stop-details">
                      <div className="stop-name-row">
                        <strong className="stop-name">{parada.nombre}</strong>
                        {isFirst && <span className="stop-type-pill start">Base de Salida</span>}
                        {isLast && <span className="stop-type-pill end">Base de Llegada</span>}
                      </div>

                      {/* Detailed street / base reference */}
                      {parada.referencia && (
                        <span className="stop-street-ref">
                          <MapPin size={11} className="ref-pin" /> {parada.referencia}
                        </span>
                      )}

                      <span className="stop-coords">
                        {Number(parada.lat).toFixed(4)}, {Number(parada.lng).toFixed(4)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Collapsible Reviews Drawer */}
        {showReviews && (
          <div className="reviews-drawer">
            <div className="reviews-header">
              <h4 className="reviews-heading">Opiniones de Pasajeros ({totalReviews})</h4>
              <button
                type="button"
                className="btn-quick-rate-link"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenRating) onOpenRating(ruta);
                }}
              >
                + Escribir reseña
              </button>
            </div>

            {ruta.ultimasResenias && ruta.ultimasResenias.length > 0 ? (
              <div className="reviews-list">
                {ruta.ultimasResenias.map((rev, rIdx) => (
                  <div key={rev.id || rIdx} className="review-bubble">
                    <div className="review-top">
                      <div className="review-user">
                        <User size={13} className="user-icon" />
                        <span>{rev.nombreUsuario || 'Pasajero'}</span>
                      </div>
                      <div className="review-stars">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={11}
                            fill={i < rev.puntuacion ? '#f59e0b' : 'none'}
                            color={i < rev.puntuacion ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                      </div>
                    </div>
                    {rev.comentario && <p className="review-text">"{rev.comentario}"</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-reviews-note">
                <p>Aún no hay opiniones escritas para esta ruta. ¡Sé el primero en calificarla!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
