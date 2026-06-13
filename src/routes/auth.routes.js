const express = require('express');
const { body } = require('express-validator');
const { register, login, updateProfile } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', [
    body('first_name').isString().trim().notEmpty().withMessage('El nombre es obligatorio y debe ser texto'),
    body('last_name').isString().trim().notEmpty().withMessage('El apellido es obligatorio y debe ser texto'),
    body('username').isString().trim().notEmpty().withMessage('El usuario es obligatorio'),
    body('email').isEmail().normalizeEmail().withMessage('Debe ser un email válido'),
    body('password').isString().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
], register);

router.post('/login', [
    body('email').isEmail().normalizeEmail().withMessage('Debe ser un email válido'),
    body('password').notEmpty().withMessage('La contraseña es obligatoria')
], login);

router.put('/update-profile/:id', updateProfile);

module.exports = router;
