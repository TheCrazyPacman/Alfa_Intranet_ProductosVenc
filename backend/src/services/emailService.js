const { Resend } = require('resend');
const { generarHtmlObservaciones } = require('../templates/emailTemplates');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarCorreoReporteObservaciones = async (destinatarios, productosReportados) => {
    try {
        const contenidoHtml = generarHtmlObservaciones(productosReportados);

        const data = await resend.emails.send({
            from: "Sistema Alfa <no-reply@alfadistribuidores.com>",
            to: destinatarios, // Resend acepta un array de strings aquí
            subject: '🚩 Reporte de Observaciones - Productos Vencidos',
            html: contenidoHtml
        });

        return { success: true, data };
    } catch (error) {
        console.error('❌ Error en Resend Servicio:', error);
        throw error;
    }
};

module.exports = { enviarCorreoReporteObservaciones };