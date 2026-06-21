const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Apply auth middleware to all address routes
router.use(authenticateToken);

router.get('/', addressController.getUserAddresses);
router.post('/', addressController.addUserAddress);

module.exports = router;
