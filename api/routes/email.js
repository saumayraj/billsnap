const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const auth = require('../middleware/auth');
const Bill = require('../../models/Bill');

// Setup nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Send PDF via email
router.post('/send-pdf', auth, async (req, res) => {
    try {
        const { billIds, recipientEmail, message } = req.body;
        
        const bills = await Bill.find({
            _id: { $in: billIds },
            userId: req.user.id
        });
        
        if (bills.length === 0) {
            return res.status(404).json({ error: 'No bills found' });
        }
        
        // Generate PDF here and send
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: recipientEmail,
            subject: 'Your BillSnap Report',
            html: `
                <h2>BillSnap Report</h2>
                <p>${message || 'Please find your scanned bills attached.'}</p>
                <p>Total Bills: ${bills.length}</p>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            `,
            attachments: [
                {
                    filename: 'BillSnap_Report.pdf',
                    content: Buffer.from('PDF Content'), // Actual PDF would go here
                    contentType: 'application/pdf'
                }
            ]
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({
            success: true,
            message: `PDF sent to ${recipientEmail}`,
            billsProcessed: bills.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
