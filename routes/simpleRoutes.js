const express = require('express');
const router = express.Router();

// Simple GET endpoint for testing connectivity
router.get('/hello', (req, res) => {
  res.json({ message: 'Hello from HaiderPay backend!' });
});

// Simple POST endpoint that echoes back received data
router.post('/echo', (req, res) => {
  res.json({ received: req.body });
});

module.exports = router;
