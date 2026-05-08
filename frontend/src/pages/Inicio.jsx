import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import './Inicio.css';
import Header from '../components/Layout/Header';

const Inicio = () => {
    const [menuAbierto, setMenuAbierto] = useState(false);
    const [userName, setUserName] = useState("");
    
    const navigate = useNavigate();
    const location = useLocation();

    const toggleMenu = () => setMenuAbierto(!menuAbierto);

    useEffect(() => {
        const userData = sessionStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            setUserName(user.nombre);
        }
    }, []);

    // Función unificada para navegar y cerrar el menú
    const irA = (ruta) => {
        navigate(ruta);
        setMenuAbierto(false);
    };

    return (
        <div className="inicio-container">
            <Header onToggleMenu={toggleMenu} />
            
            {/* Capa oscura para cerrar el menú en móviles */}
            {menuAbierto && <div className="sidebar-overlay" onClick={toggleMenu}></div>}

            <div className={`sidebar ${menuAbierto ? 'open' : ''}`}>
                {/* Ahora usamos la función irA con las rutas reales */}
                <button onClick={() => irA('/Inicio')}>Inicio</button>
                <button onClick={() => irA('/Inicio/Cargar_PV')}>Cargar Productos a Vencer</button>
                <button onClick={() => irA('/Inicio/Consultar_PV')}>Consultar Productos a Vencer</button>
            </div>

            <main className="main-content">
                <div style={{ width: '100%' }}>
                    {/* Solo mostramos la bienvenida si la ruta es exactamente /Inicio */}
                    {location.pathname === '/Inicio' && (
                        <div className="welcome-container">
                            <h1>
                                ¡Bienvenido(a),{' '}
                                <span className="no-break-zone">
                                    <span className="user-name">{userName}</span>
                                    <span className="exclamation-mark">!</span>
                                </span>
                            </h1>
                            <p>Seleccione una opción del menú lateral para comenzar a trabajar.</p>
                        </div>
                    )}

                    {/* El Outlet renderizará CargarProductos o ConsultarProductos según la URL */}
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Inicio;