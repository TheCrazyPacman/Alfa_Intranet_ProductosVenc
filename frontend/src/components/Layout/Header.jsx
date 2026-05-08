import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';
import logoAlfa from '../../assets/img/logo-corp.jpeg'; 

const Header = ({ onToggleMenu }) => {
  const navigate = useNavigate();
  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('userData');
    // Forzamos la redirección al Login o Inicio
    navigate('/Login', { replace: true });
  };
  return (
    <header className="main-header">
      <div className="header-container">
        <div className="menu-toggle-container">
          <button className="menu-hamburger-btn" onClick={onToggleMenu}>
            ☰
          </button>
        </div>
        
        <div className="footer-column">
          <img src={logoAlfa} alt="Alfa Logo" className="footer-logo" />
        </div>
        
        <nav className="nav-menu">
          <button className="logout-btn" onClick={handleLogout}>
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;