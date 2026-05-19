const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ auth: false, message: 'No se proporcionó un token.' });
    }

    const tokenLimpio = token.startsWith('Bearer ') ? token.slice(7) : token;

    jwt.verify(tokenLimpio, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ auth: false, message: 'Token inválido o expirado.' });
        }
        
        req.userId = decoded.id;
        req.userNombre = decoded.nombre;
        next();
    });
};

module.exports = verificarToken;