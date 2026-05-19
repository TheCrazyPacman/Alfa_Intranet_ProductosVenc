const { poolPromise } = require('../config/db');
const { enviarCorreoReporteObservaciones } = require('../services/emailService');

const reportarObservaciones = async (req, res) => {
    const { productos } = req.body;

    try {
        const pool = await poolPromise;
        
        // 1. Obtener correos usando ID_USUARIO según image_2a59b8.png
        const result = await pool.request().query(`
            SELECT usu_Mail 
            FROM dbo.DM_USUARIOS 
            WHERE ID_USUARIO IN ('acomercial_prb', 'adminportal_prb') 
              AND usu_Mail IS NOT NULL
        `);

        const correos = result.recordset.map(u => u.usu_Mail.trim()); // trim() por si es tipo char(21)

        if (correos.length === 0) {
            console.log("⚠️ No se encontraron correos para los IDs proporcionados.");
            return res.status(404).json({ message: "No se encontraron destinatarios configurados." });
        }

        // 2. Llamar al servicio
        await enviarCorreoReporteObservaciones(correos, productos);

        res.json({ message: "Reporte enviado exitosamente." });

    } catch (error) {
        console.error("❌ Error en Controller al reportar:", error);
        res.status(500).json({ message: "Error al procesar el reporte." });
    }
};

module.exports = { reportarObservaciones };