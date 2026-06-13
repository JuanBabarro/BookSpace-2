require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function hashPasswords() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        // Obtener todos los usuarios
        const [users] = await db.execute('SELECT id, contrasena FROM usuarios');
        
        for (const user of users) {
            const plain = user.contrasena;
            // Si ya está hasheada (empieza con $2), saltar
            if (plain.startsWith('$2')) {
                console.log(`Usuario id=${user.id} ya tiene bcrypt, saltando.`);
                continue;
            }
            const hashed = await bcrypt.hash(plain, 10);
            await db.execute('UPDATE usuarios SET contrasena = ? WHERE id = ?', [hashed, user.id]);
            console.log(`Usuario id=${user.id}: contraseña hasheada OK`);
        }

        console.log('\n✅ Listo! Todas las contraseñas están hasheadas.');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.end();
    }
}

hashPasswords();
