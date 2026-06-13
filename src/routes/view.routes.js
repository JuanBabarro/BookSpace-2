const express = require('express');
const { 
    renderLogin, 
    renderRegister, 
    renderHome, 
    renderMyList, 
    renderProfile, 
    logout 
} = require('../controllers/view.controller');

const router = express.Router();

// Rutas de vistas
router.get(['/', '/login'], renderLogin);
router.get(['/register', '/registrar'], renderRegister);
router.get(['/home', '/inicio'], renderHome);
router.get(['/mylist', '/mi-lista'], renderMyList);
router.get(['/profile', '/perfil'], renderProfile);

// Ruta de cierre de sesión
router.get('/logout', logout);

module.exports = router;
