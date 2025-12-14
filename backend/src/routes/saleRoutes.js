const express = require('express');
const router = express.Router();
const { getSales, getSalesSummary } = require('../controllers/saleController');

// Define the route for fetching sales data
// GET /api/sales?search=...&filter=...&sortBy=...&page=...
router.get('/', getSales);

// Define the route for fetching sales summary statistics
// GET /api/sales/summary?search=...&filter=...
router.get('/summary', getSalesSummary);

module.exports = router;