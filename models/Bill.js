const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: String,
    originalImage: String, // Base64
    processedImage: String, // Base64
    extractedText: String,
    amount: Number,
    vendor: String,
    date: Date,
    category: { type: String, default: 'Other' },
    tags: [String],
    notes: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bill', billSchema);
