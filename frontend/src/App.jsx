import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import RouteCard from './components/RouteCard';
import RouteMap from './components/RouteMap';
import SuggestModal from './components/SuggestModal';
import RatingModal from './components/RatingModal';
import AdminPanel from './components/AdminPanel';
import { buscarRutas } from './services/api';
import { Route, AlertCircle, RefreshCw, Compass, List, MapPin } from 'lucide-react';

export default function App() {
  const [rutas, setRutas] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('list'); // 'list' | 'map'

  // Rating Modal state
  const [ratingRoute, setRatingRoute] = useState(null);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const loadRutas = async (destino = '') => {
    setIsLoading(true);
    try {
      const response = await buscarRutas(destino);
      const data = response.data || [];
      setRutas(data);
      setIsLive(response.isLive);

      // Auto-select first route if available
      if (data.length > 0) {
        setSelectedRoute(data[0]);
      } else {
        setSelectedRoute(null);
      }
    } catch (err) {
      console.error('Error al cargar rutas:', err);
      setRutas([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRutas('');
  }, []);

  const handleSearch = (destino) => {
    setSearchQuery(destino);
    loadRutas(destino);
  };

  const handleSelectRoute = (ruta) => {
    setSelectedRoute(ruta);
    // Auto-switch to map view on mobile when a user taps a route!
    setMobileTab('map');
  };

  const handleOpenRating = (ruta) => {
    setRatingRoute(ruta);
    setIsRatingOpen(true);
  };

  const handleCloseAdmin = () => {
    setIsAdminMode(false);
    setSearchQuery('');
    loadRutas('');
  };

  const handleRouteChanged = () => {
    setSearchQuery('');
    loadRutas('');
  };

  return (
    <div className="app-container">
      <Header
        isLive={isLive}
        totalRutas={rutas.length}
        isAdminMode={isAdminMode}
        onToggleAdmin={() => {
          if (isAdminMode) {
            handleCloseAdmin();
          } else {
            setIsAdminMode(true);
          }
        }}
        onOpenSuggest={() => setIsSuggestOpen(true)}
      />

      {/* Mobile Sticky Tab Bar */}
      {!isAdminMode && (
        <div className="mobile-view-toggle">
          <button
            type="button"
            className={`btn-mobile-toggle ${mobileTab === 'list' ? 'active' : ''}`}
            onClick={() => setMobileTab('list')}
          >
            <List size={18} />
            <span>Ver Rutas ({rutas.length})</span>
          </button>
          <button
            type="button"
            className={`btn-mobile-toggle ${mobileTab === 'map' ? 'active' : ''}`}
            onClick={() => setMobileTab('map')}
          >
            <MapPin size={18} />
            <span>Ver Mapa Interactivo</span>
          </button>
        </div>
      )}

      {/* Main View: Admin Panel or Public Explorer */}
      {isAdminMode ? (
        <main className="admin-main-wrapper">
          <AdminPanel
            rutas={rutas}
            onRouteCreated={handleRouteChanged}
            onRouteDeleted={handleRouteChanged}
            onClose={handleCloseAdmin}
          />
        </main>
      ) : (
        <main className="main-content">
          {/* Left Side: Search & Routes Directory */}
          <section className={`directory-panel ${mobileTab === 'list' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <div className="directory-header">
              <h2 className="section-title">
                <Compass className="section-title-icon" size={22} />
                <span>Explorador de Rutas</span>
              </h2>
              <p className="section-desc">
                Encuentra qué combi tomar, bases de salida, paradas intermedias, tarifas y mapa.
              </p>
            </div>

            <SearchForm
              onSearch={handleSearch}
              currentQuery={searchQuery}
              isLoading={isLoading}
            />

            <div className="results-status-bar">
              <div className="results-count">
                <Route size={16} />
                <span>
                  {isLoading
                    ? 'Buscando recorridos...'
                    : `${rutas.length} ${rutas.length === 1 ? 'ruta encontrada' : 'rutas encontradas'}`}
                  {searchQuery && <em> para "{searchQuery}"</em>}
                </span>
              </div>

              <button
                type="button"
                className="btn-refresh"
                onClick={() => loadRutas(searchQuery)}
                title="Refrescar datos"
              >
                <RefreshCw size={14} className={isLoading ? 'spinning' : ''} />
              </button>
            </div>

            {/* List of Routes */}
            <div className="routes-list-container">
              {isLoading ? (
                <div className="loading-state">
                  <div className="pulse-loader"></div>
                  <p>Cargando información de transporte...</p>
                </div>
              ) : rutas.length > 0 ? (
                <div className="routes-list">
                  {rutas.map((ruta) => (
                    <RouteCard
                      key={ruta.id}
                      ruta={ruta}
                      isSelected={selectedRoute?.id === ruta.id}
                      onSelect={handleSelectRoute}
                      onOpenRating={handleOpenRating}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <AlertCircle size={44} className="empty-icon" />
                  <h3>No se encontraron rutas</h3>
                  <p>
                    No hay rutas registradas hacia <strong>"{searchQuery}"</strong>. Prueba buscando por
                    "Texcalac", "Huamantla", "Tlaxcala", "Panotla" o "Chiautempan".
                  </p>
                  <button
                    type="button"
                    className="btn-reset-search"
                    onClick={() => handleSearch('')}
                  >
                    Ver todas las rutas
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Right Side: Interactive Map */}
          <section className={`map-panel ${mobileTab === 'map' ? 'mobile-visible' : 'mobile-hidden'}`}>
            <RouteMap key={mobileTab} selectedRoute={selectedRoute} allRoutes={rutas} mobileTab={mobileTab} />
          </section>
        </main>
      )}

      {/* Community Suggestion Modal */}
      <SuggestModal
        isOpen={isSuggestOpen}
        onClose={() => setIsSuggestOpen(false)}
        onSubmitted={() => {
          handleRouteChanged();
        }}
      />

      {/* Star Rating Modal */}
      <RatingModal
        isOpen={isRatingOpen}
        ruta={ratingRoute}
        onClose={() => setIsRatingOpen(false)}
        onRatingSubmitted={() => {
          loadRutas(searchQuery);
        }}
      />
    </div>
  );
}
