import React, { useState } from 'react';
import { Search, X, MapPin, Navigation } from 'lucide-react';

const POPULAR_DESTINATIONS = [
  'Tlaxcala Centro',
  'Huamantla',
  'Chiautempan',
  'Santa Cruz',
  'Panotla'
];

export default function SearchForm({ onSearch, currentQuery, isLoading }) {
  const [query, setQuery] = useState(currentQuery || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handlePillClick = (dest) => {
    setQuery(dest);
    onSearch(dest);
  };

  return (
    <div className="search-card">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input
            id="destination-search-input"
            type="text"
            className="search-input"
            placeholder="¿A dónde viajas? Ej: Huamantla, Tlaxcala, Chiautempan..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
          />
          {query && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <button
          id="btn-search-submit"
          type="submit"
          className="search-submit-btn"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner"></span>
          ) : (
            <>
              <Navigation size={16} />
              <span>Buscar ruta</span>
            </>
          )}
        </button>
      </form>

      <div className="quick-destinations">
        <span className="quick-label">
          <MapPin size={13} /> Destinos rápidos:
        </span>
        <div className="pills-row">
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest}
              type="button"
              className={`pill-btn ${query.toLowerCase() === dest.toLowerCase() ? 'active' : ''}`}
              onClick={() => handlePillClick(dest)}
            >
              {dest}
            </button>
          ))}
          {query && (
            <button
              type="button"
              className="pill-btn pill-reset"
              onClick={handleClear}
            >
              Ver todas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
