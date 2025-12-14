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
const allowedOrigins = ['http://localhost:5173']; // Default Vite port
app.use(cors({
    origin: allowedOrigins,
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
app.listen(PORT, () => {
    console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});