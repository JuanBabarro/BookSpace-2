const db = require('../config/db');

const addReview = async (req, res) => {
    try {
        const { user_id, book_id, rating, content } = req.body;
        
        if (!user_id || !book_id || rating === undefined) {
            return res.status(400).json({ error: "Faltan datos obligatorios (user_id, book_id, rating)" });
        }

        // Tabla 'resenas' con columnas id_usuario, id_libro, contenido, calificacion
        const [existing] = await db.execute(
            'SELECT id FROM resenas WHERE id_usuario = ? AND id_libro = ?',
            [user_id, book_id]
        );
        
        if (existing.length > 0) {
            await db.execute(
                'UPDATE resenas SET calificacion = ?, contenido = ? WHERE id = ?',
                [rating, content || '', existing[0].id]
            );
            res.status(200).json({ message: "Reseña actualizada con éxito" });
        } else {
            await db.execute(
                'INSERT INTO resenas (id_usuario, id_libro, calificacion, contenido) VALUES (?, ?, ?, ?)',
                [user_id, book_id, rating, content || '']
            );
            res.status(201).json({ message: "Reseña guardada con éxito" });
        }
    } catch (err) {
        console.error("Error guardando reseña:", err);
        res.status(500).json({ error: "Error escribiendo en la base de datos" });
    }
};

const getUserReviews = async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        
        const query = `
            SELECT r.id, r.calificacion AS rating, r.contenido AS content, r.creado_el AS created_at,
                   l.titulo AS title, l.autor AS author, l.id AS book_id
            FROM resenas r
            JOIN libros l ON r.id_libro = l.id
            WHERE r.id_usuario = ?
            ORDER BY r.creado_el DESC
        `;
        
        const [rows] = await db.execute(query, [userId]);
        res.json(rows);
    } catch (err) {
        console.error("Error obteniendo reseñas:", err);
        res.status(500).json({ error: "Error leyendo la base de datos" });
    }
};

module.exports = {
    addReview,
    getUserReviews
};
