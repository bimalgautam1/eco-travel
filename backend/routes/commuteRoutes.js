const express = require('express');
const router = express.Router();
const commuteController = require('../controllers/commuteController');
const travelController = require('../controllers/travelController');
const authMiddleware = require('../middlewares/authMiddleware');

// Routes for distance and duration estimations
router.get('/route', commuteController.getRoute);

// Compare commutes and submit feedback (public for MVP hackathon frontend)
router.get('/compare', commuteController.compareRoutes);
router.post('/feedback', commuteController.submitFeedback);
router.get('/config/maps-key', commuteController.getMapsKey);

// Travel logs and history routes (protected)
router.post('/travel', authMiddleware, travelController.saveTravel);
router.get('/travel/history', authMiddleware, travelController.getTravelHistory);

module.exports = router;
