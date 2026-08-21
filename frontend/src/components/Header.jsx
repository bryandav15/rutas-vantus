import React from 'react';
import { Bus, MapPin, Database, MessageSquarePlus, ShieldCheck, LogOut } from 'lucide-react';
import logoVainitius from '../assets/logo-vainitius.svg';

export default function Header({
  isLive,
  totalRutas,
  isAdminMode,
  isAuthenticated,
  onToggleAdmin,
  onOpenSuggest,
  onLogoutAdmin
}) {
  return (
    <header className="app-header">
      <div className="header-container">
        <div className="header-brand">
          <div className="company-logo-container" title="Logo VANTUS">
            <img src={logoVainitius} alt="VANTUS" className="company-logo-img" />
          </div>

          <div className="brand-icon-wrapper">
            <Bus className="brand-icon" size={24} />
          </div>
          <div>
            <div className="brand-title-row">
              <h1 className="brand-title">RUTAS APIZACO</h1>
              <span className="brand-badge">Tlaxcala</span>
            </div>
            <p className="brand-subtitle">
              Guía centralizada de transporte público, combis y autobuses
            </p>
          </div>
        </div>

        <div className="header-actions">
          {/* Oculto en celular para maximizar espacio de scroll de rutas */}
          <div
            className={`status-pill desktop-only ${isLive ? 'live' : 'mock'}`}
            title={isLive ? 'Conectado a MySQL + Spring Boot' : 'Esperando respuesta del servidor MySQL...'}
          >
            <span className="status-dot"></span>
            <Database size={14} />
            <span>{isLive ? 'MySQL Online' : 'Conectando a BD...'}</span>
          </div>

          <div className="stats-counter-pill desktop-only">
            <MapPin size={14} className="counter-icon" />
            <span>
              <strong>{totalRutas}</strong> {totalRutas === 1 ? 'ruta' : 'rutas'}
            </span>
          </div>

          {/* Botón para que la gente envíe sugerencias (Visible y reubicado en móvil) */}
          <button
            type="button"
            className="btn-header-suggest"
            onClick={onOpenSuggest}
            title="Aportar cambio de pasaje o sugerir ruta"
          >
            <MessageSquarePlus size={15} />
            <span>Sugerir</span>
          </button>

          {/* Botón para alternar a Modo Admin (Visible solo en desktop o cuando está autenticado) */}
          <button
            type="button"
            className={`btn-header-admin desktop-only ${isAdminMode ? 'active' : ''}`}
            onClick={onToggleAdmin}
            title={isAdminMode ? 'Cerrar vista de administración' : 'Abrir Panel de Administrador (Protegido)'}
          >
            <ShieldCheck size={16} />
            <span>{isAdminMode ? 'Cerrar Admin' : 'Panel Admin'}</span>
          </button>

          {/* Botón de Logout cuando está autenticado */}
          {isAuthenticated && (
            <button
              type="button"
              className="btn-header-logout"
              onClick={onLogoutAdmin}
              title="Cerrar sesión de Administrador"
            >
              <LogOut size={15} />
              <span>Salir</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
