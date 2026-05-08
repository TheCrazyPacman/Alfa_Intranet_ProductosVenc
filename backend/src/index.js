const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);//new 

const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS 
  ? process.env.CORS_ALLOWED_ORIGINS.split(',') 
  : [];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`Bloqueado por CORS: ${origin}`);
      callback(null, true); // Sugerencia: Temporalmente true para pruebas en red local
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'], 
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const verificarToken = require('./middleware/validateJWT'); 

// RUTAS
app.use('/Intranet/api/auth', require('./routes/auth.routes')); 
app.use('/Intranet/api/productos', require('./routes/precios.routes'));

app.get('/Intranet/api/datos-privados', verificarToken, (req, res) => {
    res.json({ mensaje: `Acceso concedido para ${req.userNombre}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto: ${PORT}`);
});