// Bismi Online - Admin & Printer App (Backend-Only for Render)
// This version is a pure API server and does NOT serve any HTML files.

const { MongoClient } = require('mongodb');
const express = require('express');
const cors = require('cors');

// --- CONFIGURATION ---
const MONGO_CONNECTION_STRING = "mongodb+srv://blahblahhblublu:bismiadmin123@bismi-online.yinh41t.mongodb.net/?retryWrites=true&w=majority&appName=bismi-online";
const DB_NAME = "bismi-online-demo";
const COLLECTION_NAME = "orders";
// Render provides the PORT in an environment variable, so we use that.
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

let ordersCollection;

// --- API ENDPOINT ---
// The frontend will send new orders to this URL: https://your-render-url.onrender.com/create-order
app.post('/create-order', async (req, res) => {
    try {
        const orderDetails = req.body;
        orderDetails.status = 'new';
        orderDetails.createdAt = new Date();

        const result = await ordersCollection.insertOne(orderDetails);
        console.log(`✅ Order successfully saved to database with ID: ${result.insertedId}`);
        res.status(200).json({ success: true, orderId: result.insertedId });
    } catch (e) {
        console.error("❌ Error saving order:", e);
        res.status(500).json({ success: false, message: "Failed to save order" });
    }
});

// --- PRINTER LOGIC (This will run on the Render server) ---
// Note: This will only print to the Render logs, not a physical printer.
// The real printing will happen on the local PC app we build later.
function printReceipt(order) {
    console.log("\n" + "=".repeat(30));
    console.log("        *** NEW ORDER RECEIVED ***");
    console.log("=".repeat(30));
    const orderId = order._id;
    const createdAt = new Date(order.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const total = order.total;
    console.log(`Order ID: ${orderId}`);
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
async function main() {
    try {
        console.log("Connecting to the database...");
        const client = new MongoClient(MONGO_CONNECTION_STRING);
        await client.connect();
        const db = client.db(DB_NAME);
        ordersCollection = db.collection(COLLECTION_NAME);
        console.log("✅ Database connection successful!");

        // Start the Express server
        app.listen(PORT, () => {
            console.log(`\n✅ Server is live and listening on port ${PORT}`);
        });

        // This loop will check for new orders and print them to the Render logs.
        setInterval(async () => {
            try {
                const findResult = await ordersCollection.findOneAndUpdate(
                    { status: 'new' },
                    { $set: { status: 'processed' } } // We'll just mark it as processed for now
                );
                
                const newOrder = findResult ? findResult.value : null;

                if (newOrder) {
                    console.log(`📬 New order found! [ID: ${newOrder._id}]`);
                    printReceipt(newOrder);
                }
            } catch (e) {
                console.error("\nAn error occurred in the processing loop:", e);
            }
        }, 10000); // Check every 10 seconds

    } catch (e) {
        console.error("❌ Main application error:", e);
        process.exit(1);
    }
}

main();
