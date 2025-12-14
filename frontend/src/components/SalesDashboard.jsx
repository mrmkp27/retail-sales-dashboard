// src/components/SalesDashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { fetchSales, fetchSalesSummary } from '../services/salesApi';
import { useTheme } from '../contexts/ThemeContext';
import DataTable from './DataTable';
import FiltersPanel from './FiltersPanel';
import PaginationControls from './PaginationControls';
import SummaryCards from './SummaryCards';

// Initial state reflects the default query parameters
const INITIAL_QUERY_PARAMS = {
    search: '',
    filters: {}, // Empty object for no initial filters
    sortBy: 'operation.date', // Default sort to Date
    sortOrder: 'desc', // Newest first
    page: 1,
    limit: 10, // 10 items per page as per requirement
};

const SalesDashboard = () => {
    // 1. STATE MANAGEMENT
    const [salesData, setSalesData] = useState([]);
    const [pagination, setPagination] = useState({});
    const [summary, setSummary] = useState(null);
    const [queryParams, setQueryParams] = useState(INITIAL_QUERY_PARAMS);
    const [loading, setLoading] = useState(false);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [error, setError] = useState(null);

    // 2. DATA FETCHING LOGIC
    const loadSales = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchSales(queryParams);
            setSalesData(result.data);
            setPagination(result.pagination);
        } catch (err) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    }, [queryParams]); // Re-run whenever queryParams change

    // Summary fetching logic (only uses search and filters, not sort/pagination)
    const loadSummary = useCallback(async () => {
        setSummaryLoading(true);
        try {
            const result = await fetchSalesSummary({
                search: queryParams.search,
                filters: queryParams.filters
            });
            setSummary(result.data);
        } catch (err) {
            console.error('Error loading summary:', err);
            // Don't show error for summary, just log it
        } finally {
            setSummaryLoading(false);
        }
    }, [queryParams.search, queryParams.filters]);

    useEffect(() => {
        loadSales();
        loadSummary();
    }, [loadSales, loadSummary]);


    // 3. HANDLERS (How the UI updates the state)
    
    // Handler for search bar changes (will trigger reload via useEffect)
    const handleSearchChange = (newSearchTerm) => {
        setQueryParams(prev => ({
            ...prev,
            search: newSearchTerm,
            page: 1, // Reset to first page on new search
        }));
    };

    // Handler for filter changes
    const handleFilterChange = (newFilters) => {
        setQueryParams(prev => ({
            ...prev,
            filters: newFilters,
            page: 1, // Reset to first page on new filters
        }));
    };

    // Handler for sorting changes
    const handleSortChange = (newSortBy, newSortOrder) => {
        setQueryParams(prev => ({
            ...prev,
            sortBy: newSortBy,
            sortOrder: newSortOrder,
        }));
    };

    // Handler for pagination (Next/Previous/Page number click)
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setQueryParams(prev => ({
                ...prev,
                page: newPage,
            }));
        }
    };

    // Get theme context
    const { theme, toggleTheme } = useTheme();

    // 4. RENDERING
    return (
        <div className="sales-dashboard-container">
            <div className="dashboard-header">
                <h1>Retail Sales Management System</h1>
                <button 
                    className="theme-toggle-button"
                    onClick={toggleTheme}
                    title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                >
                    {theme === 'light' ? '🌙' : '☀️'}
                </button>
            </div>
            
            <SummaryCards summary={summary} loading={summaryLoading} />
            
            <FiltersPanel 
                currentFilters={queryParams.filters} 
                onFilterChange={handleFilterChange} 
                onSearchChange={handleSearchChange}
                currentSearch={queryParams.search}
                currentSortBy={queryParams.sortBy}
                currentSortOrder={queryParams.sortOrder}
                onSortChange={handleSortChange}
            />

            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <div className="loading-message">Loading sales data...</div>
            ) : (
                <>
                    <DataTable 
                        data={salesData} 
                        currentSortBy={queryParams.sortBy}
                        currentSortOrder={queryParams.sortOrder}
                        onSortChange={handleSortChange}
                    />

                    <PaginationControls 
                        pagination={pagination} 
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
};

export default SalesDashboard;