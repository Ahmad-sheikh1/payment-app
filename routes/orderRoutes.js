const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Public route for placing orders (no client login required)
router.post('/', orderController.placeOrder);

// Public route for fetching merchant orders
router.get('/merchant/:merchantId', orderController.getMerchantOrders);

// Apply auth middleware to standard user/rider routes
router.use(authenticateToken);
router.get('/', orderController.getUserOrders);
router.get('/:id/track', orderController.trackOrder);

module.exports = router;
