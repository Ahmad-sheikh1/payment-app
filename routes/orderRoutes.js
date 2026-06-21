const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply auth middleware to order routes
router.use(authenticateToken);

router.post('/', orderController.placeOrder);
router.get('/', orderController.getUserOrders);
router.get('/:id/track', orderController.trackOrder);

module.exports = router;
