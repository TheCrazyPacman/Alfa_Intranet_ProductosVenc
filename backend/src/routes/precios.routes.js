const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path'); // Importante para manejar extensiones si fuera necesario
const productosV = require('../controllers/productosVController');
const verificarToken = require('../middleware/validateJWT'); 

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
router.post('/actualizar-vencidos', 
    verificarToken, 
    upload.single('archivo'), 
    productosV.actualizarProductosVencidos);

router.get('/consultar-vencidos', verificarToken, productosV.consultarVencidos);
router.get('/descargar-vencidos', verificarToken, productosV.descargarVencidos);
module.exports = router;