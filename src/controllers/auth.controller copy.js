const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const db = require('../config/db');

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { first_name, last_name, username, email, password } = req.body;

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar a la base de datos
        const [result] = await db.execute(
            'INSERT INTO users (first_name, last_name, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
            [first_name, last_name, username, email, hashedPassword, 'user']
        );

        res.status(201).json({ 
            message: "Usuario registrado con éxito",
            user: { id: result.insertId, first_name, last_name, username, email }
        });
    } catch (error) {
        console.error("Error en registro:", error);
        // Manejar error de email/username duplicado
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
        // Buscar el usuario por email
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }
        
        const user = rows[0];

        // Comparar la contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // Devolver usuario sin la contraseña
        res.status(200).json({ 
            message: "Inicio de sesión exitoso",
            user: { 
                id: user.id, 
                first_name: user.first_name, 
                last_name: user.last_name, 
                username: user.username,
                email: user.email, 
                role: user.role 
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
                'UPDATE users SET first_name = ?, last_name = ?, username = ?, email = ?, password = ? WHERE id = ?',
                [first_name, last_name, username, email, hashedPassword, userId]
            );
        } else {
            await db.execute(
                'UPDATE users SET first_name = ?, last_name = ?, username = ?, email = ? WHERE id = ?',
                [first_name, last_name, username, email, userId]
            );
        }

        // Devolver los nuevos datos para actualizar la sesión en el cliente
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
