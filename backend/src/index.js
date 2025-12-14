require('dotenv').config(); 
const express = require('express');
const connectDB = require('./utils/db'); 
const saleRoutes = require('./routes/saleRoutes'); 
const cors = require('cors'); // <-- 1. Import CORS
const app = express();
const PORT = process.env.PORT || 5000; 

// --- DATABASE CONNECTION ---
connectDB(); 

// --- MIDDLEWARE ---
// 2. Use CORS middleware (Accept requests from the frontend domain)
const allowedOrigins = [
    'http://localhost:5173', // Default Vite dev port
    'http://localhost:3000', // Alternative dev port
    process.env.FRONTEND_URL, // Production frontend URL from environment
].filter(Boolean); // Remove any undefined values

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests) in development
        if (!origin && process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        // In production, require origin
        if (!origin && process.env.NODE_ENV === 'production') {
            return callback(new Error('CORS: Origin required in production'));
        }
        
        // Check if origin is in allowed list
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else if (process.env.NODE_ENV !== 'production') {
            // In development, allow all origins
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.use(express.json());

// --- ROUTES ---
app.use('/api/sales', saleRoutes); 

// Basic health check route
app.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Retail Sales Management System Backend is running!',
        environment: process.env.NODE_ENV
    });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});