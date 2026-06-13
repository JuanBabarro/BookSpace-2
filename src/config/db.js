const mysql = require('mysql2/promise');

const conexion = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQL_ADDON_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_ADDON_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB || 'book_app',
    port: process.env.DB_PORT || process.env.MYSQL_ADDON_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 30000       // 30 segundos para conectar (BD en la nube puede ser lenta)
});

module.exports = conexion;
