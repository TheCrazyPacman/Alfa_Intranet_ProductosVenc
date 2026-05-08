const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: 1433,
    options: {
        encrypt: false, //true
        trustServerCertificate: true,
    },
    connectionTimeout: 5000
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('✅ Base de datos conectada');
        return pool;
    })
    .catch(err => {
        console.error('❌ Error de conexión SQL:', err.message); 
        console.log('⚠️ Aviso: Trabajando sin conexión real a DB');
        return null;
    });

module.exports = { sql, poolPromise };