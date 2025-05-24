require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const winston = require('winston');

// Import routes
const authRoutes = require('./routes/auth.routes');
const aircraftRoutes = require('./routes/aircraft.routes');
const partsRoutes = require('./routes/parts.routes');
const maintenanceRoutes = require('./routes/maintenance.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const documentsRoutes = require('./routes/documents.routes');

// Database connection
const db = require('./models');

// Create Express app
const app = express();

// Logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AeroMaintenance API',
      version: '1.0.0',
      description: 'API for aircraft maintenance management system',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 5042}`,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/aircraft', aircraftRoutes);
app.use('/api/parts', partsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/documents', documentsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
});

// Set port and start server
const PORT = process.env.PORT || 5042;

db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' })
  .then(async () => {
    // Seed users for testing
    if (process.env.NODE_ENV === 'development') {
      try {
        require('./seeders/userSeeder');
        console.log('User seeding initiated');
      } catch (error) {
        console.error('Error running user seeder:', error);
      }
    }
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      logger.info(`Server started on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    logger.error('Database connection error:', err);
  });

module.exports = app; // For testing purposes
