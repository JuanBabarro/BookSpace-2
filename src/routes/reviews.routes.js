const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews.controller');

router.post('/', reviewsController.addReview);
router.get('/user/:userId', reviewsController.getUserReviews);

module.exports = router;
