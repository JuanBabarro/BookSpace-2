const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || process.env.MYSQL_ADDON_HOST || 'localhost',
    user: process.env.DB_USER || process.env.MYSQL_ADDON_USER || 'root',
    password: process.env.DB_PASSWORD || process.env.MYSQL_ADDON_PASSWORD || '',
    database: process.env.DB_NAME || process.env.MYSQL_ADDON_DB || 'book_app',
    port: process.env.DB_PORT || process.env.MYSQL_ADDON_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 3000 // 3 seconds timeout for quicker fallback
});

let dbConnected = null;

async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        connection.release();
        dbConnected = true;
        console.log("Conexión a la base de datos establecida correctamente.");
        return true;
    } catch (err) {
        dbConnected = false;
        console.warn("No se pudo conectar a la base de datos. Se usará el fallback local (JSON). Detalle:", err.message);
        return false;
    }
}

// Iniciar verificación de forma asíncrona
checkConnection();

module.exports = {
    pool,
    execute: async (sql, params) => {
        if (dbConnected === false) {
            throw new Error("DB_CONNECTION_FAILED");
        }
        try {
            return await pool.execute(sql, params);
        } catch (err) {
            if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.message.includes('connect')) {
                dbConnected = false;
                throw new Error("DB_CONNECTION_FAILED");
            }
            throw err;
        }
    },
    isDbConnected: async () => {
        if (dbConnected === null) {
            return await checkConnection();
        }
        return dbConnected;
    },
    checkConnection
};

