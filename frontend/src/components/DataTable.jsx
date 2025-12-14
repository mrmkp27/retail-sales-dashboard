// src/components/DataTable.jsx

import React from 'react';

// --- Column Definition ---
// Define the columns, their display name, and the exact data path for sorting/display
const columns = [
    // Customer Fields
    { key: 'customer.customerName', label: 'Customer Name', sortable: true },
    { key: 'customer.age', label: 'Age', sortable: true },
    { key: 'customer.phoneNumber', label: 'Phone Number', sortable: true },
    { key: 'customer.customerRegion', label: 'Region', sortable: true },
    { key: 'customer.customerType', label: 'Type', sortable: true },
    
    // Product Fields
    { key: 'product.productName', label: 'Product', sortable: true },
    { key: 'product.productCategory', label: 'Category', sortable: true },

    // Sales Fields
    { key: 'sales.quantity', label: 'Qty', sortable: true },
    { key: 'sales.pricePerUnit', label: 'Unit Price', sortable: true, isCurrency: true },
    { key: 'sales.finalAmount', label: 'Final Amount', sortable: true, isCurrency: true },

    // Operational Fields
    { key: 'operation.date', label: 'Date', sortable: true, isDate: true },
    { key: 'operation.orderStatus', label: 'Status', sortable: true },
];

// --- Helper Function for Nested Data Access ---
const getNestedValue = (obj, path) => {
    // Splits a path string like 'customer.customerName' into an array ['customer', 'customerName']
    const parts = path.split('.');
    let current = obj;
    for (const part of parts) {
        if (current && current[part] !== undefined) {
            current = current[part];
        } else {
            return null; // Handle missing nested property gracefully
        }
    }
    return current;
};

// --- Component Definition ---
const DataTable = ({ data, currentSortBy, currentSortOrder, onSortChange }) => {
    
    if (!data || data.length === 0) {
        return <div className="data-table-message">No sales records found.</div>;
    }

    const handleHeaderClick = (key) => {
        if (!key) return;
        
        // If sorting by the current column, toggle the order. Otherwise, default to 'asc'.
        let newSortOrder = 'asc';
        if (currentSortBy === key) {
            newSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
        }
        
        onSortChange(key, newSortOrder);
    };

    const formatCellValue = (column, value) => {
        if (column.isCurrency && value !== null) {
            return `$${value.toFixed(2)}`;
        }
        if (column.isDate && value) {
            // Converts ISO string/Date object to a local date string
            return new Date(value).toLocaleDateString();
        }
        return value || 'N/A';
    };

    return (
        <div className="table-responsive">
            <table className="sales-data-table">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th 
                                key={col.key} 
                                onClick={() => col.sortable && handleHeaderClick(col.key)}
                                className={col.sortable ? 'sortable' : ''}
                            >
                                {col.label}
                                {col.sortable && (
                                    <span className="sort-icon">
                                        {/* Display sorting indicator */}
                                        {currentSortBy === col.key 
                                            ? (currentSortOrder === 'asc' ? ' ▲' : ' ▼') 
                                            : ' ◇'}
                                    </span>
                                )}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map(sale => (
                        <tr key={sale._id}>
                            {columns.map(col => (
                                <td key={col.key}>
                                    {formatCellValue(col, getNestedValue(sale, col.key))}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;