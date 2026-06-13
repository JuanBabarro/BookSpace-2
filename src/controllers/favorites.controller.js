const db = require('../config/db');

const getFavorites = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        // Tabla 'libros_usuario' con columnas id_usuario, id_libro, pagina_marcador
        const [rows] = await db.execute(
            'SELECT id_libro AS book_id, pagina_marcador AS bookmark_page FROM libros_usuario WHERE id_usuario = ?',
            [userId]
        );
        res.json(rows);
    } catch (err) {
        console.error("Error obteniendo favoritos:", err);
        res.status(500).json({ error: "Error leyendo la base de datos" });
    }
};

const addFavorite = async (req, res) => {
    try {
        const { user_id, book_id } = req.body;
        
        if (!user_id || !book_id) {
            return res.status(400).json({ error: "Faltan datos de usuario o libro" });
        }

        const [existing] = await db.execute(
            'SELECT * FROM libros_usuario WHERE id_usuario = ? AND id_libro = ?',
            [user_id, book_id]
        );
        if (existing.length === 0) {
            await db.execute(
                'INSERT INTO libros_usuario (id_usuario, id_libro, pagina_marcador) VALUES (?, ?, 0)',
                [user_id, book_id]
            );
        }
        
        res.status(201).json({ message: "Favorito agregado con éxito" });
    } catch (err) {
        console.error("Error agregando favorito:", err);
        res.status(500).json({ error: "Error escribiendo en la base de datos" });
    }
};

const removeFavorite = async (req, res) => {
    try {
        const { user_id, book_id } = req.body;
        
        if (!user_id || !book_id) {
            return res.status(400).json({ error: "Faltan datos de usuario o libro" });
        }

        await db.execute(
            'DELETE FROM libros_usuario WHERE id_usuario = ? AND id_libro = ?',
            [user_id, book_id]
        );
        res.status(200).json({ message: "Favorito eliminado con éxito" });
    } catch (err) {
        console.error("Error eliminando favorito:", err);
        res.status(500).json({ error: "Error escribiendo en la base de datos" });
    }
};

const updateProgress = async (req, res) => {
    try {
        const { user_id, book_id, bookmark_page } = req.body;
        
        if (!user_id || !book_id) {
            return res.status(400).json({ error: "Faltan datos de usuario o libro" });
        }

        const page = bookmark_page !== undefined ? parseInt(bookmark_page) : 0;

        await db.execute(
            'INSERT INTO libros_usuario (id_usuario, id_libro, pagina_marcador) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE pagina_marcador = ?',
            [user_id, book_id, page, page]
        );
        
        res.status(200).json({ message: "Progreso actualizado con éxito" });
    } catch (err) {
        console.error("Error actualizando progreso:", err);
        res.status(500).json({ error: "Error escribiendo en la base de datos" });
    }
};

module.exports = {
    getFavorites,
    addFavorite,
    removeFavorite,
    updateProgress
};
