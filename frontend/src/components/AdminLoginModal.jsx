import React, { useState } from 'react';
import { ShieldCheck, Lock, User, Eye, EyeOff, X, AlertCircle, ArrowRight } from 'lucide-react';
import { loginAdmin } from '../services/api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await loginAdmin(username.trim(), password);
      if (res.autenticado) {
        setUsername('');
        setPassword('');
        setErrorMsg('');
        if (onLoginSuccess) {
          onLoginSuccess(res);
        }
        onClose();
      } else {
        setErrorMsg(res.mensaje || 'Credenciales incorrectas.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card admin-login-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge admin-badge-gold">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="modal-title">Acceso de Administrador</h3>
              <p className="modal-subtitle">Introduce tus credenciales para gestionar rutas y reportes</p>
            </div>
          </div>
          <button type="button" className="btn-modal-close" onClick={onClose} title="Cerrar">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-form admin-login-body">
          {errorMsg && (
            <div className="form-alert error">
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Usuario Administrador</label>
            <div className="input-icon-wrapper">
              <User size={17} className="input-left-icon" />
              <input
                type="text"
                className="form-input with-left-icon"
                placeholder="Ej. admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div className="input-icon-wrapper">
              <Lock size={17} className="input-left-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input with-left-icon with-right-btn"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn-toggle-eye"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="admin-security-note">
            🔒 Autenticación cifrada con BCrypt y protección anti-fuerza bruta activa.
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
              Cancelar
            </button>
            <button type="submit" className="btn-submit btn-admin-enter" disabled={isLoading}>
              <span>{isLoading ? 'Verificando...' : 'Iniciar Sesión'}</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
