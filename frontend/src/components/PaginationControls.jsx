// src/components/PaginationControls.jsx

import React from 'react';

const PaginationControls = ({ pagination, onPageChange }) => {
    // Destructure required metadata from the pagination object
    const { 
        totalDocs, 
        totalPages, 
        currentPage, 
        limit, 
        hasNextPage, 
        hasPrevPage 
    } = pagination;

    // Don't render if there are no documents
    if (!totalDocs || totalPages <= 1) return null;

    // Calculate the range of displayed documents for user clarity
    const startDoc = (currentPage - 1) * limit + 1;
    const endDoc = Math.min(currentPage * limit, totalDocs);

    // Handler functions
    const goToPreviousPage = () => {
        if (hasPrevPage) {
            onPageChange(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (hasNextPage) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className="pagination-container">
            <span className="pagination-status">
                Showing {startDoc} - {endDoc} of {totalDocs} results
            </span>

            <div className="pagination-buttons">
                <button
                    onClick={goToPreviousPage}
                    disabled={!hasPrevPage}
                    className="pagination-button"
                >
                    &larr; Previous
                </button>

                <span className="page-number-display">
                    Page {currentPage} of {totalPages}
                </span>

                <button
                    onClick={goToNextPage}
                    disabled={!hasNextPage}
                    className="pagination-button"
                >
                    Next &rarr;
                </button>
            </div>
        </div>
    );
};

export default PaginationControls;