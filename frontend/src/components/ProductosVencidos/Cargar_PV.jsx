import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import api from '../../api';
// 1. Importamos ToastContainer y los estilos
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import './Cargar_PV.css';

const Cargar_PV = () => {
    const [archivoRaw, setArchivoRaw] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [listoParaSubir, setListoParaSubir] = useState(false);
    const [totalRegistros, setTotalRegistros] = useState(0);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Validar extensión en el cliente
        const extension = file.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(extension)) {
            toast.error("Formato no soportado. Use .xlsx o .xls");
            e.target.value = "";
            return;
        }

        setListoParaSubir(false);
        setArchivoRaw(file);
        setCargando(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                // 2. Validar Hoja "Fechas"
                if (!workbook.SheetNames.includes("Fechas")) {
                    toast.error("El Excel no tiene la hoja 'Fechas'.");
                    setArchivoRaw(null);
                    return;
                }

                const worksheet = workbook.Sheets["Fechas"];
                const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // 3. Validar si hay registros (descontando el header)
                const filasConDatos = rawData.filter(r => r.length > 0);
                if (filasConDatos.length <= 1) {
                    toast.warn("La hoja 'Fechas' parece estar vacía.");
                    setTotalRegistros(0);
                } else {
                    setTotalRegistros(filasConDatos.length - 1);
                    setListoParaSubir(true);
                    toast.success("Estructura de archivo válida.");
                }

            } catch (error) {
                toast.error("Error al leer el archivo Excel.");
                setArchivoRaw(null);
            } finally {
                setCargando(false);
                e.target.value = ""; 
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const handleActualizar = async () => {
        setCargando(true);
        try {
            const formData = new FormData();
            formData.append('archivo', archivoRaw);
            const token = sessionStorage.getItem('token');
            
            await api.post('/productos/actualizar-vencidos', formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}` 
                }
            });
            
            toast.success("Se cargó el archivo al sistema");
            
            setArchivoRaw(null);
            setListoParaSubir(false);
            setTotalRegistros(0);
        } catch (error) {
            // --- AQUÍ CAPTURAMOS LA ALERTA DE EXCESO DE INTENTOS ---
            
            // 1. Si el servidor responde con un error (como el 429 de Rate Limit)
            if (error.response) {
                const serverMessage = error.response.data?.message;
                
                if (error.response.status === 429) {
                    // Específicamente cuando excede el límite
                    toast.error(serverMessage || "Límite de subidas excedido. Espere 10 minutos.", {
                        position: "top-center", // Lo ponemos al centro para que sea más visible
                        autoClose: 5000,
                        theme: "colored"
                    });
                } else {
                    // Otros errores del servidor (ej. archivo inválido)
                    toast.error(serverMessage || "Error al procesar el archivo.");
                }
            } else {
                // Error de red o conexión
                toast.error("Error de conexión con el servidor.");
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="module-page-container">
            {/* 2. Añadimos el contenedor aquí */}
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="upload-card">
                <header className="card-header">
                    <h2>Gestión de Productos por Vencer</h2>
                    <p>Suba el archivo Excel para actualizar el inventario del sistema.</p>
                </header>

                <section className="upload-body">
                    <div className="file-input-wrapper">
                        <label className={`custom-file-label ${archivoRaw ? 'file-selected' : ''}`}>
                            <input type="file" 
                                accept=".xlsx, .xls" 
                                onChange={handleFileUpload}
                                onClick={(e) => { e.target.value = null;}} 
                                disabled={cargando}
                            />
                            <span className="icon">{cargando ? '⌛' : '📁'}</span>
                            {cargando ? "Procesando..." : (archivoRaw ? archivoRaw.name : "Seleccionar archivo .xlsx")}
                        </label>
                    </div>

                    <div className="actions-buttons-container" style={{ gridTemplateColumns: '1fr' }}>
                        <button 
                            className={`btn-primary btn-update ${listoParaSubir ? 'active' : ''}`} 
                            onClick={handleActualizar} 
                            disabled={!listoParaSubir || cargando}
                        >
                            {cargando ? 'Sincronizando Sistema...' : 'Actualizar Sistema'}
                        </button>
                    </div>
                </section>

                <footer className="card-footer">
                    {totalRegistros > 0 && (
                        <div className="status-badge">
                            Se han detectado <strong>{totalRegistros}</strong> registros en el documento.
                        </div>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default Cargar_PV;