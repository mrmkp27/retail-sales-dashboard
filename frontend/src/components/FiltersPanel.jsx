// src/components/FiltersPanel.jsx

import React, { useState, useEffect, useCallback } from 'react';

// --- Filter Configuration ---
// This defines the filter options and how they map to the MongoDB schema fields
const FILTER_CONFIG = {
    customerRegion: { 
        label: 'Customer Region', 
        path: 'customer.customerRegion', 
        options: ['North', 'South', 'East', 'West', 'Central'],
        type: 'multi-select'
    },
    gender: {
        label: 'Gender',
        path: 'customer.gender',
        options: ['Male', 'Female', 'Other'],
        type: 'multi-select'
    },
    productCategory: { 
        label: 'Product Category', 
        path: 'product.productCategory', 
        options: ['Electronics', 'Apparel', 'Food', 'Books', 'Home Goods', 'Beauty'],
        type: 'multi-select'
    },
    tags: {
        label: 'Tags',
        path: 'product.tags',
        options: ['organic', 'skincare', 'portable', 'wireless', 'premium', 'eco-friendly', 'bestseller', 'new'],
        type: 'multi-select'
    },
    paymentMethod: {
        label: 'Payment Method',
        path: 'operation.paymentMethod',
        options: ['Credit Card', 'Cash', 'UPI', 'Wallet', 'Debit Card', 'Net Banking'],
        type: 'multi-select'
    },
    ageRange: {
        label: 'Age Range',
        path: 'customer.age',
        type: 'range'
    },
    dateRange: {
        label: 'Date Range',
        path: 'operation.date',
        type: 'date-range'
    }
};

// Sort options configuration
const SORT_OPTIONS = [
    { 
        label: 'Customer Name (A-Z)', 
        sortBy: 'customer.customerName', 
        sortOrder: 'asc' 
    },
    { 
        label: 'Newest First', 
        sortBy: 'operation.date', 
        sortOrder: 'desc' 
    },
    { 
        label: 'Oldest First', 
        sortBy: 'operation.date', 
        sortOrder: 'asc' 
    },
    { 
        label: 'Highest Quantity', 
        sortBy: 'sales.quantity', 
        sortOrder: 'desc' 
    },
];

const FiltersPanel = ({ 
    currentSearch, 
    currentFilters, 
    currentSortBy, 
    currentSortOrder,
    onSearchChange, 
    onFilterChange,
    onSortChange 
}) => {
    
    // Use local state for the search input value
    const [searchTerm, setSearchTerm] = useState(currentSearch);
    
    // Local state for age range
    const [ageMin, setAgeMin] = useState('');
    const [ageMax, setAgeMax] = useState('');
    
    // Local state for date range
    const [dateStart, setDateStart] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    
    // Local state for sort dropdown
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    
    // Memoized callback for debouncing search
    const debouncedSearch = useCallback(() => {
        if (searchTerm !== currentSearch) {
            onSearchChange(searchTerm);
        }
    }, [searchTerm, currentSearch, onSearchChange]);

    // --- Search Logic (with debounce for performance) ---
    useEffect(() => {
        const delaySearch = setTimeout(debouncedSearch, 500); // Wait 500ms after user stops typing
        return () => clearTimeout(delaySearch);
    }, [debouncedSearch]);

    // --- Multi-Select Filter Logic ---
    const handleMultiSelectFilter = (filterKey, selectedValue) => {
        const config = FILTER_CONFIG[filterKey];
        const path = config.path;
        
        let newFilters = { ...currentFilters };
        
        // Get current selected values for this filter (array or empty)
        const currentValues = newFilters[path] || [];
        const isArray = Array.isArray(currentValues);
        const selectedArray = isArray ? [...currentValues] : (currentValues ? [currentValues] : []);

        // Toggle the selected value
        if (selectedArray.includes(selectedValue)) {
            // Remove if already selected
            const filtered = selectedArray.filter(v => v !== selectedValue);
            if (filtered.length === 0) {
                delete newFilters[path];
            } else {
                newFilters[path] = filtered;
            }
        } else {
            // Add if not selected
            newFilters[path] = [...selectedArray, selectedValue];
        }

        // Send the updated filter object to the parent component
        onFilterChange(newFilters);
    };
    
    // Helper to determine if a filter option is currently active
    const isActive = (filterKey, value) => {
        const path = FILTER_CONFIG[filterKey].path;
        const currentValues = currentFilters[path];
        if (Array.isArray(currentValues)) {
            return currentValues.includes(value);
        }
        return currentValues === value;
    };

    // Handle age range filter
    const handleAgeRangeApply = () => {
        let newFilters = { ...currentFilters };
        const agePath = FILTER_CONFIG.ageRange.path;
        
        if (ageMin || ageMax) {
            newFilters[agePath] = {};
            if (ageMin) {
                newFilters[agePath].$gte = parseInt(ageMin);
            }
            if (ageMax) {
                newFilters[agePath].$lte = parseInt(ageMax);
            }
        } else {
            delete newFilters[agePath];
        }
        
        onFilterChange(newFilters);
    };

    // Handle date range filter
    const handleDateRangeApply = () => {
        let newFilters = { ...currentFilters };
        const datePath = FILTER_CONFIG.dateRange.path;
        
        if (dateStart || dateEnd) {
            newFilters[datePath] = {};
            if (dateStart) {
                newFilters[datePath].$gte = new Date(dateStart);
            }
            if (dateEnd) {
                // Set to end of day
                const endDate = new Date(dateEnd);
                endDate.setHours(23, 59, 59, 999);
                newFilters[datePath].$lte = endDate;
            }
        } else {
            delete newFilters[datePath];
        }
        
        onFilterChange(newFilters);
    };

    // Clear age range
    const handleAgeRangeClear = () => {
        setAgeMin('');
        setAgeMax('');
        let newFilters = { ...currentFilters };
        delete newFilters[FILTER_CONFIG.ageRange.path];
        onFilterChange(newFilters);
    };

    // Clear date range
    const handleDateRangeClear = () => {
        setDateStart('');
        setDateEnd('');
        let newFilters = { ...currentFilters };
        delete newFilters[FILTER_CONFIG.dateRange.path];
        onFilterChange(newFilters);
    };

    // Get current sort option label
    const getCurrentSortLabel = () => {
        const currentOption = SORT_OPTIONS.find(
            opt => opt.sortBy === currentSortBy && opt.sortOrder === currentSortOrder
        );
        return currentOption ? currentOption.label : 'Customer Name (A-Z)';
    };

    // Handle sort option selection
    const handleSortSelect = (option) => {
        onSortChange(option.sortBy, option.sortOrder);
        setIsSortDropdownOpen(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSortDropdownOpen && !event.target.closest('.sort-dropdown-container')) {
                setIsSortDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSortDropdownOpen]);

    return (
        <div className="filters-container">
            {/* 1. SEARCH AND SORT ROW */}
            <div className="search-sort-row">
                <div className="search-group">
                    <input
                        type="text"
                        placeholder="Search by Customer Name or Phone Number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
                
                {/* Sort Dropdown */}
                <div className="sort-dropdown-container">
                    <label className="sort-label">Sort by:</label>
                    <div className="sort-dropdown">
                        <button 
                            className="sort-dropdown-button"
                            onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                        >
                            <span>{getCurrentSortLabel()}</span>
                            <span className="sort-chevron">▼</span>
                        </button>
                        {isSortDropdownOpen && (
                            <div className="sort-dropdown-menu">
                                {SORT_OPTIONS.map((option) => {
                                    const isSelected = 
                                        option.sortBy === currentSortBy && 
                                        option.sortOrder === currentSortOrder;
                                    return (
                                        <div
                                            key={`${option.sortBy}-${option.sortOrder}`}
                                            className={`sort-dropdown-item ${isSelected ? 'selected' : ''}`}
                                            onClick={() => handleSortSelect(option)}
                                        >
                                            {option.label}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* 2. FILTER GROUPS */}
            <div className="filter-groups-wrapper">
                {Object.keys(FILTER_CONFIG).map(filterKey => {
                    const config = FILTER_CONFIG[filterKey];
                    const path = config.path;

                    if (config.type === 'range') {
                        // Age Range Filter
                        return (
                            <div key={filterKey} className="filter-group">
                                <label className="filter-label">{config.label}:</label>
                                <div className="range-filter">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={ageMin}
                                        onChange={(e) => setAgeMin(e.target.value)}
                                        className="range-input"
                                        min="18"
                                        max="120"
                                    />
                                    <span>to</span>
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={ageMax}
                                        onChange={(e) => setAgeMax(e.target.value)}
                                        className="range-input"
                                        min="18"
                                        max="120"
                                    />
                                    <button onClick={handleAgeRangeApply} className="apply-btn">Apply</button>
                                    {(ageMin || ageMax) && (
                                        <button onClick={handleAgeRangeClear} className="clear-btn">Clear</button>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    if (config.type === 'date-range') {
                        // Date Range Filter
                        return (
                            <div key={filterKey} className="filter-group">
                                <label className="filter-label">{config.label}:</label>
                                <div className="range-filter">
                                    <input
                                        type="date"
                                        value={dateStart}
                                        onChange={(e) => setDateStart(e.target.value)}
                                        className="range-input"
                                    />
                                    <span>to</span>
                                    <input
                                        type="date"
                                        value={dateEnd}
                                        onChange={(e) => setDateEnd(e.target.value)}
                                        className="range-input"
                                    />
                                    <button onClick={handleDateRangeApply} className="apply-btn">Apply</button>
                                    {(dateStart || dateEnd) && (
                                        <button onClick={handleDateRangeClear} className="clear-btn">Clear</button>
                                    )}
                                </div>
                            </div>
                        );
                    }

                    // Multi-select filters
                    return (
                        <div key={filterKey} className="filter-group">
                            <label className="filter-label">{config.label}:</label>
                            <div className="filter-options">
                                {config.options.map(option => (
                                    <span
                                        key={option}
                                        className={`filter-option ${isActive(filterKey, option) ? 'active' : ''}`}
                                        onClick={() => handleMultiSelectFilter(filterKey, option)}
                                    >
                                        {option}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default FiltersPanel;
