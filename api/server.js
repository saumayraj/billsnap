const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files from root
app.use(express.static(path.join(__dirname, '..')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/billsnap';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

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

module.exports = app;
