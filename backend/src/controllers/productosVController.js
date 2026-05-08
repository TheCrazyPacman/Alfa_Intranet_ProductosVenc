const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const actualizarProductosVencidos = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se recibió el archivo.' });
        }

        // 1. Definir la ruta de la carpeta uploads
        const directory = path.join(__dirname, '../../uploads');

        // 2. LIMPIEZA TOTAL: Borrar todos los archivos antiguos
        // Como Multer ya guardó el archivo nuevo, filtramos para NO borrar el recién llegado
        const files = fs.readdirSync(directory);
        for (const file of files) {
            if (file !== req.file.originalname) { // Comparamos con el nombre original
                fs.unlinkSync(path.join(directory, file));
            }
        }

        return res.json({ 
            message: 'Se cargó el archivo al sistema',
            filename: req.file.filename 
        });

    } catch (error) {
        console.error("❌ Error al actualizar productos:", error);
        res.status(500).json({ message: 'Error interno al procesar el archivo.' });
    }
};

const consultarVencidos = async (req, res) => {
    try {
        const directory = path.resolve(__dirname, '../../uploads');
        const files = fs.readdirSync(directory);
        
        console.log("1. Archivos en carpeta uploads:", files);

        if (files.length === 0) {
            console.log("❌ Error: No hay archivos físicamente en la carpeta uploads.");
            return res.json({ contenido: [] });
        }

        const filePath = path.join(directory, files[0]);
        console.log("2. Leyendo archivo en ruta:", filePath);

        const workbook = XLSX.readFile(filePath, { cellDates: true });
        console.log("3. Hojas detectadas en el Excel:", workbook.SheetNames);

        const nombreHoja = "Fechas";
        const worksheet = workbook.Sheets[nombreHoja];

        if (!worksheet) {
            return res.status(404).json({ message: `No se encontró la hoja '${nombreHoja}'` });
        }

        const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        
        if (rows.length === 0) {
            console.log("❌ Error: La hoja está totalmente vacía.");
            return res.json({ contenido: [] });
        }

        // ... resto de tu lógica de mapeo ...
        const headers = rows[0];
        const contenido = rows.slice(1)
            .filter(r => r.some(c => c !== "")) // Mantiene filas que tengan al menos un dato
            .map(row => {
                let obj = {};
                headers.forEach((h, i) => {
                    let valor = row[i];
                    // Si el valor es estrictamente null o undefined, ponemos vacío. 
                    // Si es 0, conservamos el 0.
                    obj[h] = (valor === null || valor === undefined) ? "" : valor;
                    
                    // Formatear fechas si detectamos que es un objeto Date
                    if (obj[h] instanceof Date) {
                        obj[h] = obj[h].toLocaleDateString('es-PE');
                    }
                });
                return obj;
            });

        console.log("5. Filas procesadas con éxito:", contenido.length);
        res.json({ nombreArchivoOriginal: files[0], contenido });

    } catch (error) {
        console.error("❌ Error CRÍTICO en el Backend:", error.message);
        res.status(500).json({ message: "Error interno del servidor", detalle: error.message });
    }
};

const descargarVencidos = (req, res) => {
    try {
        const directory = path.resolve(__dirname, '../../uploads');
        const files = fs.readdirSync(directory);

        if (files.length === 0) return res.status(404).json({ message: "No hay archivo" });

        const fileName = files[0];
        const filePath = path.join(directory, fileName);

        // Forzamos headers de descarga
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

        res.sendFile(filePath, (err) => {
            if (err && !res.headersSent) {
                console.error("Error al enviar archivo:", err);
                res.status(500).send("Error en la transferencia");
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error al descargar" });
    }
};

module.exports = { 
    actualizarProductosVencidos, 
    consultarVencidos, 
    descargarVencidos 
};