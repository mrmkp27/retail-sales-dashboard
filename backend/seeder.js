// Import necessary modules
require('dotenv').config(); 
const mongoose = require('mongoose'); // Mongoose is needed here for Types.ObjectId()
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const connectDB = require('./src/utils/db');
const Sale = require('./src/models/SaleModel');

// Path to the CSV file
const DATA_FILE_PATH = path.join(__dirname, 'data', 'sales_data.csv');

/**
 * Helper function to safely parse numerical values, removing common formatting issues.
 */
const cleanNumber = (value) => {
    if (!value) return 0;
    // Remove characters that are NOT digits, decimal point, or negative sign
    const cleaned = String(value).replace(/[^0-9.-]+/g, ""); 
    const number = parseFloat(cleaned);
    // If parsing results in NaN (Not a Number), default to 0 to prevent Mongoose errors
    return isNaN(number) ? 0 : number;
};

/**
 * Maps CSV row fields to the structure of our Mongoose SaleModel.
 * NOTE: The keys used in row['...'] MUST exactly match your CSV column headers.
 */
const mapCsvToSchema = (row) => {
    // --- 1. Transaction ID Handling (Fixes E11000 Error) ---
    const rawTransactionId = row['Transaction ID'] || null;
    const transactionIdValue = rawTransactionId 
        ? rawTransactionId 
        : new mongoose.Types.ObjectId().toHexString(); // Generates a unique ID if CSV field is empty
    
    // --- 2. Date Handling ---
    let saleDate = new Date(row['Date']); 
    if (isNaN(saleDate.getTime())) {
        saleDate = new Date(); 
    }

    return {
        // --- Transaction ID Field (NEW ADDITION) ---
        transactionId: transactionIdValue, // Mapped to the unique ID (CSV value or generated value)

        // --- Customer Fields ---
        customer: {
            customerId: row['Customer ID'] || 'N/A',
            customerName: row['Customer Name'] || 'Unknown',
            phoneNumber: row['Phone Number'] || null,
            gender: row['Gender'] || 'Other',
            age: cleanNumber(row['Age']), 
            customerRegion: row['Customer Region'] || 'Global',
            customerType: row['Customer Type'] || 'Regular',
        },

        // --- Product Fields ---
        product: {
            productId: row['Product ID'] || 'N/A',
            productName: row['Product Name'] || 'Unknown Product',
            brand: row['Brand'] || 'No Brand',
            productCategory: row['Product Category'] || 'Misc',
            tags: (row['Tags'] || '').split(',').map(tag => tag.trim()),
        },

        // --- Sales Fields (Critical Numerical Fixes) ---
        sales: {
            quantity: cleanNumber(row['Quantity']),
            pricePerUnit: cleanNumber(row['Price per Unit']),
            discountPercentage: cleanNumber(row['Discount Percentage']),
            totalAmount: cleanNumber(row['Total Amount']),
            finalAmount: cleanNumber(row['Final Amount']),
        },

        // --- Operational Fields ---
        operation: {
            date: saleDate, 
            paymentMethod: row['Payment Method'] || 'Cash',
            orderStatus: row['Order Status'] || 'Delivered',
            deliveryType: row['Delivery Type'] || 'Standard Shipping',
            storeId: row['Store ID'] || '000',
            storeLocation: row['Store Location'] || 'Central',
            salespersonId: row['Salesperson ID'] || 'EMP000',
            employeeName: row['Employee Name'] || 'Staff',
        },
    };
};


// Function to import data (Streaming/Batch logic remains the same)
const importData = async () => {
    await connectDB();
    
    // Use a small buffer to hold documents before inserting in a batch
    const BATCH_SIZE = 5000; 
    let batch = [];
    let count = 0;
    
    try {
        console.log('--- Starting data import process (Streaming/Batch) ---');
        console.log(`Batch size set to: ${BATCH_SIZE}`);

        const readableStream = fs.createReadStream(DATA_FILE_PATH);
        const csvStream = readableStream.pipe(csv());

        // Process data chunk by chunk
        csvStream.on('data', (row) => {
            const structuredSale = mapCsvToSchema(row);
            batch.push(structuredSale);
            count++;

            if (batch.length >= BATCH_SIZE) {
                csvStream.pause(); 
                
                Sale.insertMany(batch)
                    .then(() => {
                        process.stdout.write(`\rInserted: ${count} records...`);
                        batch = [];
                        csvStream.resume(); 
                    })
                    .catch((error) => {
                        console.error(`\n❌ Error inserting batch at count ${count}: ${error.message}`);
                        batch = []; 
                        csvStream.resume();
                    });
            }
        });

        // Handle the end of the file stream and insert the final batch
        csvStream.on('end', async () => {
            try {
                if (batch.length > 0) {
                    await Sale.insertMany(batch);
                }
                
                console.log(`\n✅ Data Import Finished! Total documents processed: ${count}`);
                process.exit(0); 
            } catch (error) {
                console.error('\n❌ Error during final batch insertion:', error.message);
                process.exit(1);
            }
        });
        
        // Handle stream errors
        csvStream.on('error', (error) => {
            console.error('\n❌ Error reading CSV file:', error.message);
            process.exit(1);
        });

    } catch (error) {
        console.error('\n❌ General Error in seeder:', error.message);
        process.exit(1);
    }
};

// Function to delete existing data
const destroyData = async () => {
    try {
        await connectDB();
        await Sale.deleteMany();
        console.log('🗑️ Data Destroyed Successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error destroying data:', error.message);
        process.exit(1);
    }
};

// Determine which function to run based on command line arguments
if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}