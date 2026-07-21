const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const USERS_JSON_PATH = path.join(__dirname, '../../users.json');

const getLocalUsers = () => {
    try {
        if (fs.existsSync(USERS_JSON_PATH)) {
            const data = fs.readFileSync(USERS_JSON_PATH, 'utf-8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error("Error al leer users.json:", err);
    }
    return [];
};

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, username, email, password } = req.body;

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar a la base de datos (columnas en español)
        const [result] = await db.execute(
            'INSERT INTO usuarios (nombre, apellido, nombre_usuario, email, contrasena, rol) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, username, email, hashedPassword, 'user']
        );

        res.status(201).json({ 
            message: "Usuario registrado con éxito",
            user: { id: result.insertId, first_name, last_name, username, email }
        });
    } catch (error) {
        console.error("Error en registro:", error);
        if (error.message === 'DB_CONNECTION_FAILED') {
            return res.status(503).json({ error: "La base de datos no está disponible. No se pueden registrar nuevos usuarios en modo local." });
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "El email o nombre de usuario ya está registrado." });
        }
        res.status(500).json({ error: "Error en el servidor al registrar el usuario" });
    }
};

const login = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        let user;
        let isDbMode = true;

        try {
            // Buscar el usuario por email en la tabla 'usuarios'
            const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
            
            if (rows.length === 0) {
                return res.status(401).json({ error: "Credenciales inválidas" });
            }
            
            user = rows[0];
        } catch (dbError) {
            console.warn("Base de datos no disponible, activando fallback local para login:", dbError.message);
            isDbMode = false;
            
            const localUsers = getLocalUsers();
            user = localUsers.find(u => u.email === email);
            if (!user) {
                return res.status(401).json({ error: "Credenciales inválidas (Modo Local)" });
            }
        }

        // Comparar la contraseña con bcrypt (columna 'contrasena') o texto plano para comodidad en local
        let isMatch = false;
        if (user.contrasena.startsWith('$2')) {
            isMatch = await bcrypt.compare(password, user.contrasena);
        } else {
            isMatch = (password === user.contrasena);
        }
        
        if (!isMatch) {
            return res.status(401).json({ error: isDbMode ? "Credenciales inválidas" : "Credenciales inválidas (Modo Local)" });
        }

        // Devolver usuario sin la contraseña, mapeando a nombres en inglés para el frontend
        res.status(200).json({ 
            message: isDbMode ? "Inicio de sesión exitoso" : "Inicio de sesión exitoso (Modo Local)",
            user: { 
                id: (user.id || user.id_usuario), 
                first_name: user.nombre, 
                last_name: user.apellido, 
                username: user.nombre_usuario,
                email: user.email, 
                role: user.rol 
            }
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: "Error en el servidor al iniciar sesión" });
    }
};

const updateProfile = async (req, res) => {
    const userId = parseInt(req.params.id);
    const { first_name, last_name, username, email, password } = req.body;

    try {
        if (password) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            await db.execute(
                'UPDATE usuarios SET nombre = ?, apellido = ?, nombre_usuario = ?, email = ?, contrasena = ? WHERE id = ?',
                [first_name, last_name, username, email, hashedPassword, userId]
            );
        } else {
            await db.execute(
                'UPDATE usuarios SET nombre = ?, apellido = ?, nombre_usuario = ?, email = ? WHERE id = ?',
                [first_name, last_name, username, email, userId]
            );
        }

        res.status(200).json({ 
            message: "Perfil actualizado con éxito",
            user: { 
                id: userId, 
                first_name, 
                last_name, 
                username,
                email
            }
        });
    } catch (error) {
        console.error("Error actualizando perfil:", error);
        if (error.message === 'DB_CONNECTION_FAILED') {
            return res.status(503).json({ error: "La base de datos no está disponible. No se puede actualizar el perfil en modo local." });
        }
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: "El email o nombre de usuario ya está en uso por otra cuenta." });
        }
        res.status(500).json({ error: "Error en el servidor al actualizar el perfil" });
    }
};

module.exports = {
    register,
    login,
    updateProfile
};
