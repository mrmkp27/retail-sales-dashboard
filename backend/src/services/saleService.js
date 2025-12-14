const Sale = require('../models/SaleModel');

/**
 * Retrieves sales data with complex query parameters (Search, Filter, Sort, Pagination).
 * @param {object} params - Object containing all query options.
 * @param {string} params.searchQuery - Text to search across multiple fields.
 * @param {object} params.filters - Key-value pairs for filtering (e.g., { 'product.productCategory': 'Apparel' }).
 * @param {string} params.sortBy - Field to sort by (e.g., 'sales.finalAmount').
 * @param {string} params.sortOrder - 'asc' or 'desc'.
 * @param {number} params.page - The current page number (1-based).
 * @param {number} params.limit - The number of documents per page.
 */
const getSalesData = async ({ 
    searchQuery, 
    filters, 
    sortBy, 
    sortOrder, 
    page, 
    limit 
}) => {
    // 1. Initialize the MongoDB Query Object
    let query = {};

    // --- SEARCH LOGIC ---
    if (searchQuery) {
        // Use $or to search across Customer Name and Phone Number as per requirements
        const searchRegex = new RegExp(searchQuery, 'i'); // 'i' for case-insensitive
        query.$or = [
            { 'customer.customerName': searchRegex },
            { 'customer.phoneNumber': searchRegex },
        ];
    }

    // --- FILTER LOGIC ---
    if (filters) {
        // Process each filter
        Object.keys(filters).forEach(filterPath => {
            const filterValue = filters[filterPath];
            
            // Handle array filters (multi-select) - use $in operator
            if (Array.isArray(filterValue) && filterValue.length > 0) {
                // Special handling for tags (array field matching)
                if (filterPath === 'product.tags') {
                    // For tags array field, match if the array contains any of the selected tags
                    // MongoDB automatically matches array fields when using $in
                    query[filterPath] = { $in: filterValue };
                } else {
                    // For other multi-select filters, use $in
                    query[filterPath] = { $in: filterValue };
                }
            }
            // Handle range filters (age range, date range) - already in correct format
            else if (typeof filterValue === 'object' && filterValue !== null && !Array.isArray(filterValue)) {
                // Check if it's a range filter (has $gte or $lte)
                if (filterValue.$gte !== undefined || filterValue.$lte !== undefined) {
                    query[filterPath] = filterValue;
                } else {
                    // Regular object filter
                    query[filterPath] = filterValue;
                }
            }
            // Handle single value filters
            else if (filterValue !== null && filterValue !== undefined) {
                query[filterPath] = filterValue;
            }
        });
    }

    // 2. Initialize Sorting, Pagination parameters
    const sort = {};
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // --- SORT LOGIC ---
    if (sortBy) {
        // Mongoose sort order: 1 for 'asc', -1 for 'desc'
        const order = (sortOrder === 'desc' ? -1 : 1);
        sort[sortBy] = order;
    } else {
        // Default sort (e.g., newest first)
        sort['operation.date'] = -1;
    }

    // 3. Execute the Query and Count the Total Results
    const [sales, totalDocs] = await Promise.all([
        // Find documents based on the complex query
        Sale.find(query)
            .sort(sort) // Apply sorting
            .skip(skip) // Apply skip for pagination
            .limit(limitNum) // Apply limit for pagination
            .lean(), // lean() makes the query faster by returning plain JS objects

        // Count total documents matching the filter (for pagination metadata)
        Sale.countDocuments(query),
    ]);

    // 4. Calculate Pagination Metadata
    const totalPages = Math.ceil(totalDocs / limitNum);

    return {
        sales,
        pagination: {
            totalDocs,
            totalPages,
            currentPage: pageNum,
            limit: limitNum,
            hasNextPage: pageNum < totalPages,
            hasPrevPage: pageNum > 1
        }
    };
};

// --- CRUD HELPER FUNCTIONS (New additions to complete the service layer) ---

const createSale = async (saleData) => {
    const sale = new Sale(saleData);
    return await sale.save();
};

const getSaleById = async (id) => {
    return await Sale.findById(id).lean();
};

const updateSale = async (id, updateData) => {
    return await Sale.findByIdAndUpdate(id, updateData, { 
        new: true, 
        runValidators: true 
    }).lean();
};

const deleteSale = async (id) => {
    return await Sale.findByIdAndDelete(id).lean();
};

/**
 * Get summary statistics (total units, total amount, total discount) based on search and filters
 * @param {object} params - Object containing search and filter options (same as getSalesData)
 * @param {string} params.searchQuery - Text to search across multiple fields.
 * @param {object} params.filters - Key-value pairs for filtering.
 */
const getSalesSummary = async ({ searchQuery, filters }) => {
    // Build the same query as getSalesData (without pagination/sorting)
    let query = {};

    // --- SEARCH LOGIC ---
    if (searchQuery) {
        const searchRegex = new RegExp(searchQuery, 'i');
        query.$or = [
            { 'customer.customerName': searchRegex },
            { 'customer.phoneNumber': searchRegex },
        ];
    }

    // --- FILTER LOGIC ---
    if (filters) {
        Object.keys(filters).forEach(filterPath => {
            const filterValue = filters[filterPath];
            
            if (Array.isArray(filterValue) && filterValue.length > 0) {
                if (filterPath === 'product.tags') {
                    query[filterPath] = { $in: filterValue };
                } else {
                    query[filterPath] = { $in: filterValue };
                }
            }
            else if (typeof filterValue === 'object' && filterValue !== null && !Array.isArray(filterValue)) {
                if (filterValue.$gte !== undefined || filterValue.$lte !== undefined) {
                    query[filterPath] = filterValue;
                } else {
                    query[filterPath] = filterValue;
                }
            }
            else if (filterValue !== null && filterValue !== undefined) {
                query[filterPath] = filterValue;
            }
        });
    }

    // Use aggregation to calculate totals
    const summary = await Sale.aggregate([
        { $match: query },
        {
            $group: {
                _id: null,
                totalUnits: { $sum: '$sales.quantity' },
                totalAmount: { $sum: '$sales.finalAmount' },
                totalDiscount: { 
                    $sum: { 
                        $subtract: ['$sales.totalAmount', '$sales.finalAmount'] 
                    } 
                },
                totalRecords: { $sum: 1 }
            }
        }
    ]);

    // Return default values if no data matches
    if (summary.length === 0) {
        return {
            totalUnits: 0,
            totalAmount: 0,
            totalDiscount: 0,
            totalRecords: 0
        };
    }

    return summary[0];
};

module.exports = {
    getSalesData,
    getSalesSummary,
    createSale,
    getSaleById,
    updateSale,
    deleteSale,
};