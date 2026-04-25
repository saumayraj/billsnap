const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    vendor: String,
    description: String,
    date: { type: Date, default: Date.now },
    paymentMethod: { type: String, default: 'cash' }, // cash, card, etc
    status: { type: String, default: 'pending' }, // pending, verified, reconciled
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Index for faster queries
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
