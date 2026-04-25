const express = require('express');
const router = express.Router();
const Expense = require('../../models/Expense');
const auth = require('../middleware/auth');

// Get all expenses for user
router.get('/', auth, async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        
        let query = { userId: req.user.id };
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }
        
        if (category) query.category = category;
        
        const expenses = await Expense.find(query)
            .sort({ date: -1 });
        
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get expense summary
router.get('/summary/:period', auth, async (req, res) => {
    try {
        const { period } = req.params; // daily, weekly, monthly, yearly
        
        let startDate = new Date();
        
        switch(period) {
            case 'daily':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'weekly':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'monthly':
                startDate.setDate(1);
                break;
            case 'yearly':
                startDate.setMonth(0, 1);
                break;
        }
        
        const expenses = await Expense.aggregate([
            {
                $match: {
                    userId: require('mongoose').Types.ObjectId(req.user.id),
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { total: -1 }
            }
        ]);
        
        const totalAmount = expenses.reduce((sum, item) => sum + item.total, 0);
        
        res.json({
            period,
            totalAmount,
            byCategory: expenses
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create expense
router.post('/', auth, async (req, res) => {
    try {
        const expense = new Expense({
            userId: req.user.id,
            ...req.body
        });
        
        await expense.save();
        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update expense
router.patch('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );
        
        if (!expense) return res.status(404).json({ error: 'Expense not found' });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
    try {
        const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!expense) return res.status(404).json({ error: 'Expense not found' });
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
