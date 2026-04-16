require('express-async-errors');
const express = require('express');
const cors = require('cors');
const errorHandler = require('./src/middlewares/errorHandler');

// Route imports
const eventTypeRoutes = require('./src/routes/eventTypes');
const availabilityRoutes = require('./src/routes/availability');
const slotRoutes = require('./src/routes/slots');
const bookingRoutes = require('./src/routes/bookings');
const userRoutes = require('./src/routes/users');

const app = express();

// CORS Configuration
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'x-user-id']
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Configure Routes
app.use('/api/event-types', eventTypeRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
