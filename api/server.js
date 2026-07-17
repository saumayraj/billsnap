const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Fix for Node.js v18+ SRV lookup issue with MongoDB Atlas
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from root
app.use(express.static(path.join(__dirname, '..')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI;
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/billsnap';

mongoose.set('strictQuery', false);

const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000,
    family: 4 // Force IPv4 — fixes SRV resolution on Node v24
};

async function startApp() {
    // Routes
    app.use('/api/bills', require('./routes/bills'));
    app.use('/api/users', require('./routes/users'));
    app.use('/api/expenses', require('./routes/expenses'));
    app.use('/api/ocr', require('./routes/ocr'));
    app.use('/api/email', require('./routes/email'));
    app.use('/api/storage', require('./routes/storage'));

    // Serve index.html for all non-API routes
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    });

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 BillSnap server running on port ${PORT}`);
    });
}

async function connectMongo(uri, label) {
    console.log(`🔌 Connecting to ${label}...`);
    await mongoose.connect(uri, mongooseOptions);
    console.log(`✅ Connected to ${label}`);
}

async function startServer() {
    try {
        if (MONGODB_URI) {
            try {
                await connectMongo(MONGODB_URI, 'MongoDB Atlas');
                await startApp();
                return;
            } catch (error) {
                console.error('❌ MongoDB Atlas connection failed:', error);
                console.error('   - If you are using Atlas, make sure your current IP address is allowed in the cluster IP access list.');
                console.error('   - If you want to run locally instead, either remove MONGODB_URI from .env or add a local MongoDB instance at mongodb://localhost:27017/billsnap.');
            }
        }

        console.warn('⚠️  Falling back to local MongoDB at mongodb://localhost:27017/billsnap');
        await connectMongo(LOCAL_MONGODB_URI, 'local MongoDB');
        await startApp();
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message || err);
        process.exit(1);
    }
}

startServer();

module.exports = app;
