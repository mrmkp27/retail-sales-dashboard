import axios from 'axios';

// Define the base URL for the backend API
// You might use an environment variable (VITE_API_URL) for production,
// but for development, we can hardcode the URL.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/sales';

/**
 * Constructs the query string from search, filter, sort, and pagination params.
 * @param {object} params - All query parameters (search, filters, sortBy, etc.).
 */
const buildQueryParams = (params) => {
    const query = new URLSearchParams();

    // 1. Search (Simple string query)
    if (params.search) {
        query.append('search', params.search);
    }

    // 2. Filters (Needs to be stringified JSON for complex filters)
    if (params.filters && Object.keys(params.filters).length > 0) {
        // The backend expects a JSON string for the 'filter' parameter
        query.append('filter', JSON.stringify(params.filters));
    }

    // 3. Sorting
    if (params.sortBy) {
        query.append('sortBy', params.sortBy);
        // Default sortOrder to 'asc' if not provided
        query.append('sortOrder', params.sortOrder || 'asc');
    }

    // 4. Pagination
    if (params.page) {
        query.append('page', params.page);
    }
    if (params.limit) {
        query.append('limit', params.limit);
    }

    return query.toString();
};


/**
 * Fetches sales data from the backend with complex query parameters.
 * @param {object} params - Object containing search, filter, sort, and pagination options.
 * @returns {Promise<object>} - An object containing sales data and pagination metadata.
 */
export const fetchSales = async (params) => {
    try {
        const queryString = buildQueryParams(params);
        const response = await axios.get(`${API_URL}?${queryString}`);
        
        // The backend response is expected to be:
        // { success: true, data: [sales records], pagination: {...} }
        return response.data;
    } catch (error) {
        console.error('Error fetching sales data:', error);
        // Throw a user-friendly error
        throw new Error(error.response?.data?.message || 'Failed to connect to the sales API.');
    }
};

/**
 * Builds query params for summary (only search and filters, no sort/pagination)
 * @param {object} params - Object containing search and filter options.
 */
const buildSummaryQueryParams = (params) => {
    const query = new URLSearchParams();

    // 1. Search
    if (params.search) {
        query.append('search', params.search);
    }

    // 2. Filters
    if (params.filters && Object.keys(params.filters).length > 0) {
        query.append('filter', JSON.stringify(params.filters));
    }

    return query.toString();
};

/**
 * Fetches sales summary statistics from the backend.
 * @param {object} params - Object containing search and filter options.
 * @returns {Promise<object>} - An object containing summary statistics.
 */
export const fetchSalesSummary = async (params) => {
    try {
        const queryString = buildSummaryQueryParams(params);
        const response = await axios.get(`${API_URL}/summary?${queryString}`);
        
        // The backend response is expected to be:
        // { success: true, data: { totalUnits, totalAmount, totalDiscount, totalRecords } }
        return response.data;
    } catch (error) {
        console.error('Error fetching sales summary:', error);
        throw new Error(error.response?.data?.message || 'Failed to connect to the sales summary API.');
    }
};