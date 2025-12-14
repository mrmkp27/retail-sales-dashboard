const mongoose = require('mongoose');

// Define the comprehensive Schema for a single Sales Transaction
const saleSchema = new mongoose.Schema({
    // --- Transaction ID (MongoDB handles _id, but we keep the Transaction ID if needed) ---
    transactionId: { type: String, unique: true, index: true },

    // --- Customer Fields ---
    customer: {
        customerId: { type: String, required: true },
        customerName: { type: String, required: true, index: true },
        phoneNumber: { type: String, index: true },
        gender: { type: String, index: true },
        age: { type: Number, min: 18, max: 120 },
        customerRegion: { type: String, required: true, index: true },
        customerType: { 
            type: String, 
            enum: ['Regular', 'New', 'Wholesale', 'Online', 'Loyal', 'Returning'], 
            default: 'Regular'
        },
    },

    // --- Product Fields ---
    product: {
        productId: { type: String, required: true },
        productName: { type: String, required: true, index: true },
        brand: { type: String, index: true },
        productCategory: { type: String, required: true, index: true },
        tags: [String],
    },

    // --- Sales Fields (Numerical data) ---
    sales: {
        quantity: { type: Number, required: true, min: 1 },
        pricePerUnit: { type: Number, required: true, min: 0 },
        discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
        totalAmount: { type: Number, required: true, min: 0 },
        finalAmount: { type: Number, required: true, min: 0, index: true },
    },

    // --- Operational Fields ---
    operation: {
        date: { type: Date, required: true, default: Date.now, index: true },
        paymentMethod: { 
            type: String, 
            enum: ['Credit Card', 'Cash', 'UPI', 'Net Banking', 'Wallet', 'Debit Card'], 
            default: 'Credit Card'
        },
        orderStatus: { 
            type: String, 
            enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned', 'Completed'], 
            default: 'Pending' 
        },
        deliveryType: { 
            type: String, 
            enum: ['Standard Shipping', 'Express Delivery', 'In-Store Pickup', 'Standard', 'Express', 'Store Pickup'], 
            default: 'Standard Shipping' 
        },
        storeId: { type: String },
        storeLocation: { type: String, index: true },
        salespersonId: { type: String },
        employeeName: { type: String },
    },
}, { 
    timestamps: true 
});

// Create the Model
const Sale = mongoose.model('Sale', saleSchema);

module.exports = Sale;