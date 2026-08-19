import React, { useState } from 'react';
import { X, Star, Send, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { calificarRuta } from '../services/api';

export default function RatingModal({ isOpen, ruta, onClose, onRatingSubmitted }) {
  const [puntuacion, setPuntuacion] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !ruta) return null;

  const RATING_LABELS = {
    1: '⭐ Pésimo servicio / Mal trato',
    2: '⭐⭐ Regular / Demora mucho',
    3: '⭐⭐⭐ Bueno / Aceptable',
    4: '⭐⭐⭐⭐ Muy bueno / Cómodo',
    5: '⭐⭐⭐⭐⭐ ¡Excelente servicio y puntual!'
  };

  const QUICK_TAGS = [
    '⏱️ Muy puntual',
    '🧼 Unidad limpia',
    '👨‍✈️ Chofer amable y prudente',
    '⚡ Recorrido rápido',
    '💺 Asientos cómodos',
    '🎵 Música con volumen moderado'
  ];

  const handleTagClick = (tag) => {
    if (comentario.includes(tag)) {
      setComentario(comentario.replace(tag, '').replace(/,\s*,/g, ',').trim());
    } else {
      setComentario(prev => prev ? `${prev}, ${tag}` : tag);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!puntuacion) {
      setErrorMsg('Por favor selecciona una puntuación en estrellas.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await calificarRuta(ruta.id, {
        puntuacion,
        comentario: comentario.trim(),
        nombreUsuario: nombreUsuario.trim() || 'Pasajero'
      });

      setIsSuccess(true);
      if (onRatingSubmitted) onRatingSubmitted();

      setTimeout(() => {
        setIsSuccess(false);
        setComentario('');
        setNombreUsuario('');
        setPuntuacion(5);
        onClose();
      }, 1800);
    } catch (err) {
      setErrorMsg('No se pudo enviar tu calificación. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card rating-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge gold">
              <Star size={20} />
            </div>
            <div>
              <h3 className="modal-title">Calificar Ruta {ruta.numero}</h3>
              <p className="modal-subtitle">{ruta.nombre}</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {isSuccess ? (
          <div className="modal-success-state">
            <CheckCircle2 size={50} className="success-icon" />
            <h4>¡Gracias por calificar!</h4>
            <p>Tu opinión ayuda a otros pasajeros a conocer el estado y calidad del servicio de esta ruta.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            {errorMsg && (
              <div className="form-alert error">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Interactive Stars Selector */}
            <div className="star-rating-selector-box">
              <label className="form-label text-center">¿Qué tal tu experiencia en esta combi?</label>
              
              <div className="stars-row">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = (hoverRating || puntuacion) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      className={`star-btn ${isFilled ? 'filled' : ''}`}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setPuntuacion(starVal)}
                    >
                      <Star
                        size={32}
                        className="star-icon"
                        fill={isFilled ? '#f59e0b' : 'none'}
                        color={isFilled ? '#f59e0b' : '#cbd5e1'}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="rating-verbal-score">
                {RATING_LABELS[hoverRating || puntuacion]}
              </div>
            </div>

            {/* Quick Feedback Tags */}
            <div className="form-group">
              <label className="form-label">Destacar aspectos clave (Opcional)</label>
              <div className="quick-tags-wrap">
                {QUICK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag-chip ${comentario.includes(tag) ? 'selected' : ''}`}
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Escribe tu opinión o recomendación (Opcional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Ej. La combi pasa cada 10 minutos, sale puntual desde la base..."
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tu Nombre o Alias (Opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej. Pasajero Frecuente"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-submit gold-btn" disabled={isSubmitting}>
                <Send size={16} />
                <span>{isSubmitting ? 'Publicando...' : 'Publicar Calificación'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
