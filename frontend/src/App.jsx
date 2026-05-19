import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Login from './pages/login';
import Inicio from './pages/Inicio';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import CargarProductos from './components/ProductosVencidos/Cargar_PV';
import ConsultarProductos from './components/ProductosVencidos/Consultar_PV';

// IMPORTANTE: Asegúrate de tener estas dos líneas para que no falle el renderizado
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <>
      <Router basename="/Intranet">
        <Routes>
          {/* Cambiamos /Login por /login en minúsculas para ser consistentes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Ruta principal de Inicio */}
          <Route 
            path="/Inicio" 
            element={
              <ProtectedRoute>
                <Inicio />
              </ProtectedRoute>
            } 
          >
            {/* Sub-rutas */}
            <Route path="Cargar_PV" element={<CargarProductos />} />
            <Route path="Consultar_PV" element={<ConsultarProductos />} />
          </Route>
          
          {/* Cualquier ruta desconocida dentro de /Intranet/ mandará al login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>

      <ToastContainer 
        position="top-right"
        autoClose={4000}
        limit={3}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </>
  );
}

export default App;