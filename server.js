require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./config/db');
const { initDataStore } = require('./config/dataStore');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const addressRoutes = require('./routes/addressRoutes');
const orderRoutes = require('./routes/orderRoutes');
const businessRoutes = require('./routes/businessRoutes');
const helloRoutes = require('./routes/helloRoutes');
const simpleRoutes = require('./routes/simpleRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Bind Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/businesses', businessRoutes);

app.use('/api/hello', helloRoutes);
app.use('/api/simple', simpleRoutes);
app.get('/', (req, res) => {
  const db = require('./config/db');
  res.json({
    status: 'online',
    app: 'HaiderPay API Server',
    databaseMode: db.isPostgresConnected() ? 'PostgreSQL' : 'Local JSON File DB',
    time: new Date()
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Try connecting to PostgreSQL (falls back to local mode if offline)
  await connectDB();
  
  // Initialize datasets & fallback store files
  await initDataStore();

  app.listen(PORT, () => {
    console.log(`🚀 HaiderPay Server running on port ${PORT}`);
  });
};

startServer();
