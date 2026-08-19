import React from 'react';
import { Bus, MapPin, Database, MessageSquarePlus, ShieldCheck, ArrowLeft } from 'lucide-react';
import logoVainitius from '../assets/logo-vainitius.svg';

export default function Header({
  isLive,
  totalRutas,
  isAdminMode,
  onToggleAdmin,
  onOpenSuggest
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
          <div
            className={`status-pill ${isLive ? 'live' : 'mock'}`}
            title={isLive ? 'Conectado a MySQL + Spring Boot' : 'Almacenamiento Local (Modo Mock Activo)'}
          >
            <span className="status-dot"></span>
            <Database size={14} />
            <span>{isLive ? 'MySQL Online' : 'Modo Offline / Local'}</span>
          </div>

          <div className="stats-counter-pill">
            <MapPin size={14} className="counter-icon" />
            <span>
              <strong>{totalRutas}</strong> {totalRutas === 1 ? 'ruta' : 'rutas'}
            </span>
          </div>

          {/* Botón para que la gente envíe sugerencias */}
          <button
            type="button"
            className="btn-header-suggest"
            onClick={onOpenSuggest}
            title="Aportar cambio de pasaje o sugerir ruta"
          >
            <MessageSquarePlus size={15} />
            <span>Sugerir / Reportar</span>
          </button>

          {/* Botón para alternar a Modo Admin */}
          <button
            type="button"
            className={`btn-header-admin ${isAdminMode ? 'active' : ''}`}
            onClick={onToggleAdmin}
            title={isAdminMode ? 'Salir del modo admin' : 'Abrir Panel de Administrador'}
          >
            <ShieldCheck size={16} />
            <span>{isAdminMode ? 'Cerrar Admin' : 'Panel Admin'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
