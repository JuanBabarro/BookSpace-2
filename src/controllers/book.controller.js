const db = require('../config/db');

const getAllBooks = async (req, res) => {
    try {
        // Devolver columnas con sus nombres originales en español para que el frontend los use directamente
        const [rows] = await db.execute('SELECT * FROM libros');
        res.json(rows);
    } catch (err) {
        console.error("Error obteniendo libros:", err);
        res.status(500).json({ error: "Error leyendo la base de datos" });
    }
};

const getBookById = async (req, res) => {
    try {
        const bookId = parseInt(req.params.id);
        const [rows] = await db.execute('SELECT * FROM libros WHERE id = ?', [bookId]);
        
        if (rows.length > 0) {
            const book = rows[0];
            let responseBook = { ...book };
            // url_pdf puede ser un ID de Google Drive o una URL completa
            if (responseBook.url_pdf && !responseBook.url_pdf.startsWith('http')) {
                responseBook.pdfUrl = `https://drive.google.com/file/d/${responseBook.url_pdf}/preview`;
                responseBook.isGoogleDrive = true;
            } else if (responseBook.url_pdf) {
                responseBook.pdfUrl = responseBook.url_pdf;
                responseBook.isGoogleDrive = false;
            } else {
                responseBook.pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
                responseBook.isGoogleDrive = false;
            }
            res.json(responseBook);
        } else {
            res.status(404).json({ error: "Libro no encontrado" });
        }
    } catch (err) {
        console.error("Error obteniendo el libro:", err);
        res.status(500).json({ error: "Error leyendo la base de datos" });
    }
};

module.exports = {
    getAllBooks,
    getBookById
};
