const jwt = require('jsonwebtoken'); 
const axios = require('axios');
const { poolPromise, sql } = require('../config/db'); 

const SECRET_KEY = process.env.JWT_SECRET || 'CLAVE_SUPER_SECRETA_ALFA';

const login = async (req, res) => {
    const { username, password, tokenSecurity } = req.body;
    
    console.log("--------------------------------");
    console.log(`🔑 Intento de login: ${username}`);

    try {
        
        
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${tokenSecurity}`
        );

        if (!response.data.success) {
            console.log("❌ Falló validación de reCAPTCHA"); //TCP QUITAR SI NO HAY TURNSTILE
            return res.status(403).json({ status: 1, message: "Validación de seguridad fallida." });
        }

        // 2. CONSULTA A BASE DE DATOS (Volvemos a validar password en SQL)
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ID_USUARIO', sql.Char(21), username)
            .input('USU_PASSWORD', sql.NChar(20), password) // Reincorporado
            .execute('dbo.usp_Usuarios_Login_Intranet_PRB');

        const row = result.recordset[0];

        if (row && row.RPTA === "0") {
            console.log("✅ Acceso concedido");
            const nombreFinal = row.NOMBRE ? row.NOMBRE.trim() : username;
            const correoFinal = row.MAIL ? row.MAIL.trim() : '';
            const rucFinal = username.trim();
            const token = jwt.sign(
                { id: rucFinal,
                    nombre: nombreFinal, 
                    email: correoFinal }, 
                SECRET_KEY, 
                { expiresIn: '2h' }
            );

            return res.json({
                status: 0,
                token: token,
                user: { nombre: nombreFinal, email: correoFinal, rol: 'Interno', ruc: rucFinal }
            });
        } else {
            // El mensaje viene directamente del SP (Ej: "Password Incorrecto")
            return res.status(401).json({ 
                status: 1, 
                message: row ? row.RPTA : "Error de autenticación" 
            });
        }

    } catch (err) {
        console.error("❌ Error en loginController:", err.message);
        return res.status(500).json({ status: 1, message: "Error interno del servidor." });
    }
};

module.exports = { login };