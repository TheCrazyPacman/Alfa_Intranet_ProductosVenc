import React, { useState } from 'react';
import api from '../../api';
import { toast } from 'react-toastify';
import './Consultar_PV.css';

const Consultar_PV = () => {
    const [datos, setDatos] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [nombreArchivo, setNombreArchivo] = useState("Reporte_Productos_Vencidos.xlsx");
    const [orden, setOrden] = useState({ columna: 'VENCIMIENTO', direccion: 'asc' });
    const [fechaActualizacion, setFechaActualizacion] = useState(null);
    const [seleccionados, setSeleccionados] = useState([]); // Guardará los índices de las filas
    const [observaciones, setObservaciones] = useState({}); // Guardará { index: 'texto' }
    
    const [permisos, setPermisos] = useState({ 
        puedeSeleccionar: false, 
        puedeVerObservaciones: false, 
        puedeReportar: false 
    });

    const obtenerDatosVencimiento = async () => {
        toast.dismiss();
        setCargando(true);
        try {
            const token = sessionStorage.getItem('token');
            const response = await api.get('/productos/consultar-vencidos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.contenido) {
                setDatos(response.data.contenido);
                setNombreArchivo(response.data.nombreArchivoOriginal);
                setFechaActualizacion(response.data.fechaCarga);
                setPermisos(response.data.permisos);
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

    const manejarOrden = (nombreColumna) => {
        const nuevaDireccion = orden.columna === nombreColumna && orden.direccion === 'asc' ? 'desc' : 'asc';
        setOrden({ columna: nombreColumna, direccion: nuevaDireccion });

        const copiaDatos = [...datos].sort((a, b) => {
            let valA = a[nombreColumna];
            let valB = b[nombreColumna];

            // Lógica específica para fechas DD/MM/YYYY
            if (nombreColumna.toUpperCase() === 'VENCIMIENTO') {
                const convertirFecha = (str) => {
                    if (!str) return 0;
                    const [d, m, y] = str.split('/').map(Number);
                    return new Date(y, m - 1, d).getTime();
                };
                valA = convertirFecha(valA);
                valB = convertirFecha(valB);
            }

            if (valA < valB) return nuevaDireccion === 'asc' ? -1 : 1;
            if (valA > valB) return nuevaDireccion === 'asc' ? 1 : -1;
            return 0;
        });

        setDatos(copiaDatos);
        setSeleccionados([]); 
        setObservaciones({});
    };

    const haySeleccionados = seleccionados.length > 0;

    const handleReportar = async () => {
        if (seleccionados.length === 0) return;

        const productosParaReportar = seleccionados.map(index => {
            const fila = datos[index];
            
            // Buscador flexible que ignora mayúsculas, minúsculas y tildes básicas
            const getVal = (posiblesNombres) => {
                const keyEncontrada = Object.keys(fila).find(k => 
                    posiblesNombres.some(nombre => 
                        k.trim().toUpperCase() === nombre.toUpperCase()
                    )
                );
                return fila[keyEncontrada] !== undefined ? fila[keyEncontrada] : 'N/A';
            };

            return {
                // Mapeamos a las llaves que espera el emailTemplates.js
                codigo: getVal(['CODIGO', 'CÓDIGO', 'ITEM']), 
                descripcion: getVal(['DESCRIPCION', 'DESCRIPCIÓN', 'PRODUCTO']),
                conteo: getVal(['CONTEO', 'CANTIDAD', 'FISICO']),
                sistema: getVal(['SISTEMA', 'STOCK']),
                vencimiento: getVal(['VENCIMIENTO', 'FECHA VENCIMIENTO']),
                dif: getVal(['DIF', 'DIFERENCIA']),
                proveedor: getVal(['PROVEEDOR', 'LABORATORIO']),
                observacion: observaciones[index] || "Sin observaciones"
            };
        });

        toast.info("Enviando reporte...");
        setCargando(true);

        try {
            const token = sessionStorage.getItem('token');
            await api.post('/productos/reportar-observaciones', 
                { productos: productosParaReportar },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast.success(`Reporte enviado correctamente.`);
            
            // Limpiar selección tras éxito
            setSeleccionados([]);
            setObservaciones({});
        } catch (error) {
            console.error("Error al enviar reporte:", error);
            toast.error("No se pudo enviar el reporte.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="consultar-container">
            
            <div className="header-consulta">
                <div className="titulo-seccion">
                    <h2>Consulta de Productos a Vencer</h2>
                    {fechaActualizacion && (
                        <p className="fecha-actualizacion">
                            Actualizado al: <strong>{new Date(fechaActualizacion).toLocaleString('es-PE')}</strong>
                            <br /><span>Archivo: 📄 {nombreArchivo}</span>
                        </p>
                        
                    )}
                </div>
                <div className="button-group">
                    <button className="btn-consultar" onClick={obtenerDatosVencimiento} disabled={cargando}>
                        🔍 Consultar Productos
                    </button>
                    <button className="btn-descargar" onClick={handleDescargar} disabled={cargando}>
                        📥 Descargar Excel
                    </button>
                    {permisos.puedeReportar && haySeleccionados && (
                        <button 
                            className="btn-reportar" 
                            onClick={handleReportar}
                            // Bloquea el botón si cargando es true
                            disabled={cargando} 
                            style={{ 
                                // Si está cargando se pone gris, si no, naranja
                                backgroundColor: cargando ? '#95a5a6' : '#e67e22', 
                                color: 'white', 
                                cursor: cargando ? 'not-allowed' : 'pointer',
                                animation: 'fadeIn 0.3s',
                                transition: 'background-color 0.3s ease' // Suaviza el cambio de color
                            }}
                        >
                            {cargando ? (
                                <>⏳ Enviando reporte...</>
                            ) : (
                                <>🚩 Reportar Observaciones ({seleccionados.length})</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            {cargando ? (
                <div className="loading-state">Procesando datos del servidor...</div>
            ) : (
                <div className="table-scroll-container">
                    <table className="modern-table">
                        <thead>
                            <tr>
                                {/* COLUMNA SELECCIÓN (Sticky en 0px) */}
                                {permisos.puedeSeleccionar && (
                                    <th className="sticky-col" style={{ left: '0', zIndex: 40, width: '45px', minWidth: '45px' }}>
                                        <input 
                                            type="checkbox" 
                                            onChange={(e) => {
                                                if (e.target.checked) setSeleccionados(datos.map((_, i) => i));
                                                else setSeleccionados([]);
                                            }}
                                        />
                                    </th>
                                )}

                                {/* COLUMNA LIST (Sticky en 45px) */}
                                <th className="sticky-col col-indice" style={{ 
                                    left: permisos.puedeSeleccionar ? '45px' : '0', 
                                    zIndex: 40, width: '55px' 
                                }}>
                                    List
                                </th>
                                
                                {/* COLUMNAS DINÁMICAS */}
                                {datos.length > 0 && Object.keys(datos[0])
                                // Filtramos para eliminar columnas vacías o sin nombre real
                                .filter(columna => columna && !columna.startsWith('__EMPTY') && columna.trim() !== "")
                                .map((columna) => (
                                    <th 
                                        key={columna} 
                                        onClick={() => manejarOrden(columna)}
                                        className="header-ordenable"
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                            {columna}
                                            <span style={{ fontSize: '0.8rem', color: orden.columna === columna ? '#00d1b2' : '#ccc' }}>
                                                {orden.columna === columna ? (orden.direccion === 'asc' ? '▲' : '▼') : '↕'}
                                            </span>
                                        </div>
                                    </th>
                                ))}

                                {/* COLUMNA OBSERVACIÓN */}
                                {permisos.puedeVerObservaciones && <th style={{ minWidth: '200px' }}>Observación</th>}
                            </tr>
                        </thead>
                        <tbody>
                        {datos.length > 0 ? (
                            datos.map((fila, index) => {
                                const estaSeleccionado = seleccionados.includes(index);
                                return (
                                    <tr key={index} className={estaSeleccionado ? 'row-selected' : ''}>
                                        {/* 1. Checkbox (Sticky left 0) */}
                                        {permisos.puedeSeleccionar && (
                                            <td className="sticky-col" style={{ left: '0', textAlign: 'center', minWidth: '45px' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={estaSeleccionado}
                                                    onChange={() => {
                                                        setSeleccionados(prev => 
                                                            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
                                                        );
                                                    }}
                                                />
                                            </td>
                                        )}

                                        {/* 2. Número de lista (Sticky left 45px) */}
                                        <td className="sticky-col" style={{ 
                                                left: permisos.puedeSeleccionar ? '45px' : '0', 
                                                fontWeight: 'bold' 
                                        }}>
                                            {index + 1}
                                        </td>
                                        
                                        {/* 3. Datos del Excel (FILTRADOS) */}
                                        {Object.keys(fila)
                                            .filter(key => key && !key.startsWith('__EMPTY') && key.trim() !== "")
                                            .map((key, i) => {
                                                const valor = fila[key];
                                                return (
                                                    <td key={i} style={valor === 0 || valor === "0" ? { fontWeight: 'bold', color: '#999' } : {}}>
                                                        {valor === 0 ? "0" : String(valor)}
                                                    </td>
                                                );
                                            })
                                        }

                                        {/* 4. Input de Observación */}
                                        {permisos.puedeVerObservaciones && (
                                            <td>
                                                <input 
                                                    type="text"
                                                    placeholder="Añadir nota..."
                                                    disabled={!estaSeleccionado}
                                                    value={observaciones[index] || ""}
                                                    onChange={(e) => setObservaciones({
                                                        ...observaciones, 
                                                        [index]: e.target.value 
                                                    })}
                                                    className="input-observacion-estilo"
                                                />
                                            </td>
                                        )}
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                {/* Ajuste dinámico del colSpan para el mensaje de vacío */}
                                <td colSpan={Object.keys(datos[0] || {}).filter(k => k && !k.startsWith('__EMPTY') && k.trim() !== "").length + 3} className="empty-row">
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