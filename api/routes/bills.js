const express = require('express');
const router = express.Router();
const multer = require('multer');
const Bill = require('../../models/Bill');
const Expense = require('../../models/Expense');
const auth = require('../middleware/auth');
const { performOCR } = require('../utils/ocr');
const { generatePDF } = require('../utils/pdf');

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Upload bill
router.post('/upload', auth, upload.array('images'), async (req, res) => {
    try {
        const bills = [];
        
        for (const file of req.files) {
            const imageBase64 = file.buffer.toString('base64');
            
            // Perform OCR
            const extractedData = await performOCR(`data:image/jpeg;base64,${imageBase64}`);

            // Smart category detection
            const category = detectCategory(extractedData.text, extractedData.vendor);
            
            const bill = new Bill({
                userId: req.user.id,
                fileName: file.originalname,
                originalImage: imageBase64,
                processedImage: imageBase64,
                extractedText: extractedData.text,
                amount: extractedData.amount,
                vendor: extractedData.vendor,
                date: extractedData.date || new Date(),
                category
            });
            
            await bill.save();

            // Auto-create expense so dashboard shows data
            if (extractedData.amount) {
                const expense = new Expense({
                    userId: req.user.id,
                    billId: bill._id,
                    amount: extractedData.amount,
                    category,
                    vendor: extractedData.vendor || file.originalname,
                    date: extractedData.date || new Date(),
                    description: extractedData.text?.substring(0, 100),
                    paymentMethod: detectPaymentMethod(extractedData.text),
                    status: 'verified'
                });
                await expense.save();
            }

            bills.push(bill);
        }
        
        res.json({ success: true, bills, message: `${bills.length} bills uploaded successfully` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Detect category from OCR text
function detectCategory(text, vendor) {
    const t = (text || '').toLowerCase();
    const v = (vendor || '').toLowerCase();
    if (/food|restaurant|cafe|swiggy|zomato|pizza|burger|hotel|dhaba|canteen|mess/.test(t + v)) return 'Food';
    if (/transport|uber|ola|auto|taxi|fuel|petrol|diesel|metro|bus|train|irctc/.test(t + v)) return 'Transport';
    if (/medical|pharma|medicine|hospital|clinic|doctor|health|chemist/.test(t + v)) return 'Medical';
    if (/electric|electricity|water|gas|broadband|internet|wifi|bsnl|jio|airtel/.test(t + v)) return 'Utilities';
    if (/institute|college|school|university|fee|tuition|hostel|library/.test(t + v)) return 'Education';
    if (/amazon|flipkart|myntra|mall|shop|store|mart|bazaar/.test(t + v)) return 'Shopping';
    return 'Other';
}

// Detect payment method
function detectPaymentMethod(text) {
    const t = (text || '').toLowerCase();
    if (/upi|gpay|phonepe|paytm/.test(t)) return 'UPI';
    if (/credit|debit|card/.test(t)) return 'Card';
    if (/cash/.test(t)) return 'Cash';
    if (/neft|rtgs|imps/.test(t)) return 'Bank Transfer';
    return 'Other';
}

// Get all bills for user
router.get('/', auth, async (req, res) => {
    try {
        const bills = await Bill.find({ userId: req.user.id })
            .sort({ createdAt: -1 });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get bill by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const bill = await Bill.findOne({ _id: req.params.id, userId: req.user.id });
        if (!bill) return res.status(404).json({ error: 'Bill not found' });
        res.json(bill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update bill
router.patch('/:id', auth, async (req, res) => {
    try {
        const { amount, vendor, category, tags, notes, date } = req.body;
        
        const bill = await Bill.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { amount, vendor, category, tags, notes, date, updatedAt: new Date() },
            { new: true }
        );
        
        if (!bill) return res.status(404).json({ error: 'Bill not found' });
        
        // Update or create associated expense
        const expense = await Expense.findOneAndUpdate(
            { billId: bill._id },
            { amount, category, vendor, date, description: notes },
            { new: true, upsert: true }
        );
        
        res.json({ bill, expense });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete bill
router.delete('/:id', auth, async (req, res) => {
    try {
        const bill = await Bill.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!bill) return res.status(404).json({ error: 'Bill not found' });
        
        // Delete associated expense
        await Expense.deleteOne({ billId: bill._id });
        
        res.json({ message: 'Bill deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Generate PDF from bills
router.post('/generate-pdf', auth, async (req, res) => {
    try {
        const { billIds } = req.body;
        
        const bills = await Bill.find({
            _id: { $in: billIds },
            userId: req.user.id
        });
        
        if (bills.length === 0) {
            return res.status(404).json({ error: 'No bills found' });
        }
        
        const pdfBuffer = await generatePDF(bills);
        
        res.set('Content-Type', 'application/pdf');
        res.set('Content-Disposition', 'attachment; filename="BillSnap.pdf"');
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search bills
router.get('/search/:query', auth, async (req, res) => {
    try {
        const bills = await Bill.find({
            userId: req.user.id,
            $or: [
                { vendor: { $regex: req.params.query, $options: 'i' } },
                { category: { $regex: req.params.query, $options: 'i' } },
                { tags: { $in: [new RegExp(req.params.query, 'i')] } }
            ]
        });
        res.json(bills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
