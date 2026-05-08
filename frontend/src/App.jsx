import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css'
import Login from './pages/login';
import Inicio from './pages/Inicio';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

import CargarProductos from './components/ProductosVencidos/Cargar_PV';
import ConsultarProductos from './components/ProductosVencidos/Consultar_PV';

function App() {
 return (
    <Router basename="/Intranet">
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />
        <Route path="/Login" element={<Login />} />

        {/* Ruta principal de Inicio */}
        <Route 
          path="/Inicio" 
          element={
            <ProtectedRoute>
              <Inicio />
            </ProtectedRoute>
          } 
        >
          {/* Sub-rutas para que cambie la URL */}
          <Route path="Cargar_PV" element={<CargarProductos />} />
          <Route path="Consultar_PV" element={<ConsultarProductos />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/Login" replace />} />
      </Routes>
    </Router>
  );
}

export default App
