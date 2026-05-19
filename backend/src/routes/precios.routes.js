const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Importante para manejar extensiones si fuera necesario
const productosV = require('../controllers/productosVController');
const verificarToken = require('../middleware/validateJWT'); 
const rateLimit = require('express-rate-limit');
const email = require('../controllers/emailController');

// --- CONFIGURACIÓN DE ALMACENAMIENTO PERSONALIZADO ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Definimos la carpeta de destino
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // file.originalname conserva el nombre exacto con el que se subió
        cb(null, file.originalname); 
    }
});
const upload = multer({ storage: storage });

const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 5, // Limita cada IP a 5 peticiones por ventana
    message: { message: 'Has excedido tu límite de intentos, por favor vuelve a intentarlo en 10 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/actualizar-vencidos', 
    verificarToken, uploadLimiter,
    upload.single('archivo'), 
    productosV.actualizarProductosVencidos);

router.get('/consultar-vencidos', verificarToken, productosV.consultarVencidos);
router.get('/descargar-vencidos', verificarToken, productosV.descargarVencidos);
router.post('/reportar-observaciones', verificarToken, email.reportarObservaciones);

module.exports = router;