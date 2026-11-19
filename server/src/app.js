const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { initDatabase } = require('./config/db');
const { errorHandler } = require('./middleware/errorMapper');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Global Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MediCore Hospital Management API',
    database: process.env.DB_NAME || 'medicore_transactional',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/clinical', require('./routes/clinical'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/bills', require('./routes/billing'));
app.use('/api/lab-tools', require('./routes/labTools'));
app.use('/api/reports', require('./routes/labTools'));
app.use('/api', require('./routes/labTools')); // for /api/map/patients

// Serve Production Client Assets if built
const fs = require('fs');
const rootDistPath = path.join(__dirname, '../../dist');
const clientDistPath = fs.existsSync(rootDistPath) ? rootDistPath : path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

// 404 Handler for APIs
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: `API endpoint ${req.originalUrl} not found.` });
});

// Central MySQL Error Mapper Middleware
app.use(errorHandler);

// Start Server and Initialize Additive Database Schemas
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` MediCore API Server running on http://localhost:${PORT}`);
    console.log(` Database: ${process.env.DB_NAME || 'medicore_transactional'}`);
    console.log(`====================================================`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = app;
