require('dotenv').config();
const express = require('express');
const path = require('path');


const vistaRoutes = require('./src/routes/view.routes');
const libroRoutes = require('./src/routes/book.routes');
const autenticacionRoutes = require('./src/routes/auth.routes');
const favoritoRoutes = require('./src/routes/favorites.routes');
const resenaRoutes = require('./src/routes/reviews.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas de Vistas (Frontend)
app.use('/', vistaRoutes);

// Rutas de API
app.use('/api/libros', libroRoutes);
app.use('/api/auth', autenticacionRoutes);
app.use('/api/favoritos', favoritoRoutes);
app.use('/api/resenas', resenaRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
