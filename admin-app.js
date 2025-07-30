// Bismi Online - Admin & Printer App (Simplified for Debugging)
// This version ONLY acts as a web server to test the connection.
// It has NO database connection.

const express = require('express');
const cors = require('cors');
const path = require('path');

// --- CONFIGURATION ---
const PORT = 3000;

const app = express();
app.use(cors());
app.use(express.json());


// --- SERVE THE FRONTEND WEBSITE ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- API ENDPOINT ---
app.post('/create-order', async (req, res) => {
    // This log is the most important part for debugging.
    console.log(`\n➡️ Received a request at /create-order at ${new Date().toLocaleTimeString()}`);
    
    try {
        const orderDetails = req.body;
        console.log("Received order details:", orderDetails);
        
        // We are not saving to the DB in this test, just confirming receipt.
        printReceipt(orderDetails);

        // Send a success response back to the frontend
        res.status(200).json({ success: true, message: "Order received by server!" });

    } catch (e) {
        console.error("❌ Error processing order:", e);
        res.status(500).json({ success: false, message: "Failed to process order on server" });
    }
});


// --- PRINTER LOGIC ---
function printReceipt(order) {
    console.log("\n" + "=".repeat(30));
    console.log("        *** NEW ORDER (TEST) ***");
    console.log("=".repeat(30));
    const createdAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const total = order.total;
    console.log(`Time: ${createdAt}`);
    console.log("-".repeat(30));
    console.log("Items:");
    for (const itemId in order.items) {
        const itemDetails = order.items[itemId];
        console.log(`- ${itemDetails.name} (x${itemDetails.count}) - ₹${itemDetails.price * itemDetails.count}`);
    }
    console.log("-".repeat(30));
    console.log(`TOTAL: ₹${total}`);
    console.log("=".repeat(30) + "\n");
}

// --- MAIN APPLICATION LOGIC ---
function main() {
    try {
        // Start the Express server
        app.listen(PORT, () => {
            console.log(`\n✅ Your app is live! Open http://localhost:${PORT} in your browser.`);
            console.log("Waiting for an order from the website...");
        });

    } catch (e) {
        console.error("❌ Main application error:", e);
        process.exit(1);
    }
}

main();
