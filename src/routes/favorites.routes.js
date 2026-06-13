const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites.controller');

router.get('/:userId', favoritesController.getFavorites);
router.post('/', favoritesController.addFavorite);
router.delete('/', favoritesController.removeFavorite);
router.put('/progress', favoritesController.updateProgress);

module.exports = router;
