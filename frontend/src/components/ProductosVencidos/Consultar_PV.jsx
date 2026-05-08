import React, { useState } from 'react';
import api from '../../api';
import { toast, ToastContainer } from 'react-toastify';
import './Consultar_PV.css';

const Consultar_PV = () => {
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [nombreArchivo, setNombreArchivo] = useState("Reporte_Productos_Vencidos.xlsx");

    const obtenerDatosVencimiento = async () => {
        setCargando(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await api.get('/productos/consultar-vencidos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.contenido && response.data.contenido.length > 0) {
                setDatos(response.data.contenido);
                setNombreArchivo(response.data.nombreArchivoOriginal);
                toast.success("Datos cargados.");
            } else {
                // Si el backend responde pero el contenido está vacío
                toast.warn("El servidor dice que no hay datos procesables.");
            }
        } catch (error) {
            // --- AQUÍ LA ALERTA TÉCNICA ---
            const mensajeError = error.response?.data?.message || "Error de conexión";
            console.error("Error completo:", error);
            toast.error(`Fallo: ${mensajeError}`);
        } finally {
            setCargando(false);
        }
    };

    const handleDescargar = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await api.get('/productos/descargar-vencidos', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'arraybuffer', // Cambiamos blob por arraybuffer para mayor estabilidad
            });

            // 1. Convertimos el buffer a Blob explícitamente
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });

            // 2. Verificamos tamaño
            if (blob.size === 0) {
                toast.error("El servidor devolvió un archivo vacío.");
                return;
            }

            // 3. Crear URL
            const url = window.URL.createObjectURL(blob);
            
            // 4. Crear el enlace de forma manual y forzar el disparo
            const link = document.createElement('a');
            link.href = url;
            
            // Usamos el nombre del archivo guardado o el genérico
            link.setAttribute('download', nombreArchivo || "Productos_Vencidos.xlsx");
            
            // IMPORTANTE: El link debe estar físicamente en el documento para que algunos navegadores lo permitan
            document.body.appendChild(link);
            
            // Ejecutamos el click directamente
            link.click();
            
            // Limpieza con retraso
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(link);
            }, 150);

            toast.success("¡Descarga exitosa!");

        } catch (error) {
            console.error("Error en la descarga:", error);
            toast.error("Error al obtener el archivo del servidor.");
        }
    };

    return (
        <div className="consultar-container">
            <ToastContainer />
            <div className="header-consulta">
                <h2>Consulta de Productos a Vencer </h2>
                <div className="button-group">
                    <button className="btn-consultar" onClick={obtenerDatosVencimiento} disabled={cargando}>
                        🔍 Consultar Productos
                    </button>
                    <button className="btn-descargar" onClick={handleDescargar} disabled={cargando}>
                        📥 Descargar Excel
                    </button>
                </div>
            </div>

            {cargando ? (
                <div className="loading-state">Procesando datos del servidor...</div>
            ) : (
                <div className="table-scroll-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                {/* Asegúrate de escribir el nombre aquí claramente */}
                                <th className="sticky-col">List</th> 
                                
                                {datos.length > 0 && Object.keys(datos[0]).map((columna) => (
                                    <th key={columna}>{columna}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {datos.length > 0 ? (
                                datos.map((fila, index) => (
                                    <tr key={index}>
                                        {/* Añadimos la clase sticky-col a la celda del índice */}
                                        <td className="sticky-col">{index + 1}</td>
                                        
                                        {Object.values(fila).map((valor, i) => (
                                            <td key={i}>
                                                {valor === 0 ? "0" : String(valor)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="10" className="empty-row">
                                        Presione el botón de consulta para obtener datos actualizados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Consultar_PV;