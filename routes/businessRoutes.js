const express = require('express');
const router = express.Router();
const businessController = require('../controllers/businessController');

router.get('/', businessController.getAllBusinesses);
router.get('/:id/products', businessController.getBusinessProducts);

module.exports = router;
