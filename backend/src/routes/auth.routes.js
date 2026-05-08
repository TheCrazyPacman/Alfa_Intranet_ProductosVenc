const express = require('express');
const router = express.Router();
// Importamos el controlador que ya tiene la lógica de login con bcrypt
const authController = require('../controllers/loginController'); 
const { poolPromise } = require('../config/db');
//const bcrypt = require('bcryptjs');

router.post('/login', authController.login);

module.exports = router;