const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', productController.getAllProducts);
router.get('/deals/super', productController.getSuperDeals);
router.get('/:id', productController.getProductById);
router.post('/', productController.createProduct);

module.exports = router;
