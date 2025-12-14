const saleService = require('../services/saleService');

/**
 * @desc Get all sales data with search, filter, sort, and pagination
 * @route GET /api/sales
 * @access Public 
 */
const getSales = async (req, res) => {
    try {
        // Destructure parameters from the URL query string (req.query)
        const { search, filter, sortBy, sortOrder, page, limit } = req.query;

        // --- Prepare Filters ---
        let filters = {};
        if (filter) {
            try {
                // Assuming 'filter' is a JSON string from the frontend (e.g., {"product.category": "Apparel"})
                filters = JSON.parse(filter);
            } catch (e) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid JSON format for 'filter' parameter." 
                });
            }
        }
        
        // --- Call the Service Layer ---
        const data = await saleService.getSalesData({
            searchQuery: search,
            filters,
            sortBy,
            sortOrder,
            page,
            limit
        });

        // --- Send Success Response ---
        res.status(200).json({
            success: true,
            message: 'Sales data retrieved successfully.',
            data: data.sales,
            pagination: data.pagination,
        });

    } catch (error) {
        console.error('Error fetching sales data:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error: Could not fetch sales data.', 
            error: error.message 
        });
    }
};

/**
 * @desc Get single sale record by ID
 * @route GET /api/sales/:id
 * @access Public 
 */
const getSaleById = async (req, res) => {
    try {
        const sale = await saleService.getSaleById(req.params.id);
        if (!sale) {
            return res.status(404).json({ success: false, message: 'Sale record not found' });
        }
        res.status(200).json({ success: true, data: sale });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error: Could not fetch sale record.' });
    }
};

/**
 * @desc Create a new sale record
 * @route POST /api/sales
 * @access Public 
 */
const createSale = async (req, res) => {
    try {
        const newSale = await saleService.createSale(req.body);
        // Respond with 201 Created status
        res.status(201).json({ success: true, message: 'Sale record created successfully', data: newSale });
    } catch (error) {
        // Validation errors (e.g., missing required field) will return a 400 Bad Request
        res.status(400).json({ success: false, message: 'Validation Error during creation.', error: error.message });
    }
};

/**
 * @desc Update a sale record by ID
 * @route PUT /api/sales/:id
 * @access Public 
 */
const updateSale = async (req, res) => {
    try {
        const updatedSale = await saleService.updateSale(req.params.id, req.body);
        if (!updatedSale) {
            return res.status(404).json({ success: false, message: 'Sale record not found' });
        }
        res.status(200).json({ success: true, message: 'Sale record updated successfully', data: updatedSale });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Validation Error during update.', error: error.message });
    }
};

/**
 * @desc Delete a sale record by ID
 * @route DELETE /api/sales/:id
 * @access Public 
 */
const deleteSale = async (req, res) => {
    try {
        const deletedSale = await saleService.deleteSale(req.params.id);
        if (!deletedSale) {
            return res.status(404).json({ success: false, message: 'Sale record not found' });
        }
        // Respond with 204 No Content status for successful deletion
        res.status(204).json({ success: true, message: 'Sale record deleted successfully' }); 
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error: Could not delete sale record.' });
    }
};

/**
 * @desc Get summary statistics (total units, total amount, total discount) with search and filters
 * @route GET /api/sales/summary
 * @access Public 
 */
const getSalesSummary = async (req, res) => {
    try {
        const { search, filter } = req.query;

        // --- Prepare Filters ---
        let filters = {};
        if (filter) {
            try {
                filters = JSON.parse(filter);
            } catch (e) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Invalid JSON format for 'filter' parameter." 
                });
            }
        }
        
        // --- Call the Service Layer ---
        const summary = await saleService.getSalesSummary({
            searchQuery: search,
            filters
        });

        // --- Send Success Response ---
        res.status(200).json({
            success: true,
            message: 'Sales summary retrieved successfully.',
            data: summary,
        });

    } catch (error) {
        console.error('Error fetching sales summary:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error: Could not fetch sales summary.', 
            error: error.message 
        });
    }
};

module.exports = {
    getSales,
    getSalesSummary,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
};