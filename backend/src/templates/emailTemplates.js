const generarHtmlObservaciones = (productosReportados) => {
    const filasHtml = productosReportados.map((prod, index) => {
        // Esta función busca la propiedad sin importar el casing
        const c = (p) => {
            const key = Object.keys(prod).find(k => k.toLowerCase() === p.toLowerCase());
            return (prod[key] !== undefined && prod[key] !== null) ? prod[key] : 'N/A';
        };

        return `
            <tr>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${index + 1}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${c('codigo')}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${c('descripcion')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${c('conteo')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${c('sistema')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${c('vencimiento')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${c('dif')}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${c('proveedor')}</td>
                <td style="border: 1px solid #ddd; padding: 8px; background-color: #fff3e0;">
                    <strong>${prod.observacion || 'Sin observaciones'}</strong>
                </td>
            </tr>
        `;
    }).join('');

    return `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #e67e22;">🚩 Reporte de Observaciones de Productos</h2>
            <p>Se han reportado incidencias en los siguientes productos:</p>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="border: 1px solid #ddd; padding: 12px;">#</th>
                        <th style="border: 1px solid #ddd; padding: 12px;">Código</th>
                        <th style="border: 1px solid #ddd; padding: 12px;">Descripción</th>
                        <th style="border: 1px solid #ddd; padding: 12px;">Conteo</th>
                        <th style="border: 1px solid #ddd; padding: 12px;">Sistema</th>
                        <th style="border: 1px solid #ddd; padding: 12px;">Vencimiento</th>
                        <th style="border: 1px solid #ddd; padding: 12px;">DIF</th>
                        <th style="border: 1px solid #ddd; padding: 12px;">Proveedor</th>
                        <th style="border: 1px solid #ddd; padding: 12px;">Observación</th>
                    </tr>
                </thead>
                <tbody>${filasHtml}</tbody>
            </table>
            <p style="margin-top: 20px; font-size: 0.8em; color: #777;">Este es un mensaje automático del Portal de Intranet - Reporte de Productos Vencidos</p>
        </div>`;
};

module.exports = { generarHtmlObservaciones };