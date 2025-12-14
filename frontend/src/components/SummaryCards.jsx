// src/components/SummaryCards.jsx

import React from 'react';

const SummaryCards = ({ summary, loading }) => {
    if (loading) {
        return (
            <div className="summary-cards-container">
                <div className="summary-card">Loading...</div>
                <div className="summary-card">Loading...</div>
                <div className="summary-card">Loading...</div>
            </div>
        );
    }

    // Format number with Indian currency format (₹) and commas
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Format number with commas
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    const totalUnits = summary?.totalUnits || 0;
    const totalAmount = summary?.totalAmount || 0;
    const totalDiscount = summary?.totalDiscount || 0;
    const totalRecords = summary?.totalRecords || 0;

    return (
        <div className="summary-cards-container">
            <div className="summary-card">
                <div className="summary-card-header">
                    <span className="summary-card-title">Total units sold</span>
                    <span className="info-icon" title="Total quantity of all products sold">ℹ️</span>
                </div>
                <div className="summary-card-value">{formatNumber(totalUnits)}</div>
            </div>

            <div className="summary-card">
                <div className="summary-card-header">
                    <span className="summary-card-title">Total Amount</span>
                    <span className="info-icon" title="Total final amount of all sales">ℹ️</span>
                </div>
                <div className="summary-card-value">{formatCurrency(totalAmount)}</div>
                <div className="summary-card-subtitle">({formatNumber(totalRecords)} SRs)</div>
            </div>

            <div className="summary-card">
                <div className="summary-card-header">
                    <span className="summary-card-title">Total Discount</span>
                    <span className="info-icon" title="Total discount applied across all sales">ℹ️</span>
                </div>
                <div className="summary-card-value">{formatCurrency(totalDiscount)}</div>
                <div className="summary-card-subtitle">({formatNumber(totalRecords)} SRs)</div>
            </div>
        </div>
    );
};

export default SummaryCards;

