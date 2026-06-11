const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

/**
 * POST /api/ai/chat
 * Streaming SSE chat endpoint. Auth is optional — history only injected when logged in.
 */
router.post('/chat', (req, res) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    // Try to authenticate, but fall through if token is invalid
    authMiddleware(req, res, () => aiController.chat(req, res));
  } else {
    aiController.chat(req, res);
  }
});

/**
 * GET /api/ai/recommend
 * Personalized "Today's Smart Pick" — requires login to access travel history.
 */
router.get('/recommend', authMiddleware, aiController.recommend);

/**
 * POST /api/ai/carbon-story
 * Carbon impact story after logging a trip — requires login.
 */
router.post('/carbon-story', authMiddleware, aiController.carbonStory);

module.exports = router;
