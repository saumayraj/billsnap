const Tesseract = require('tesseract.js');

async function performOCR(imageData) {
    try {
        const result = await Tesseract.recognize(imageData, 'eng', {});
        const text = result.data.text;

        const extractedData = {
            text,
            amount: extractAmount(text),
            vendor: extractVendor(text),
            date: extractDate(text),
            confidence: result.data.confidence
        };

        return extractedData;
    } catch (error) {
        console.error('OCR Error:', error);
        return { text: '', amount: null, vendor: null, date: null, error: error.message };
    }
}

function extractAmount(text) {
    // Priority order: look for the most prominent/total amount

    // Indian UPI/GPay receipts: ₹31,000 or Rs. 31,000
    const rupeePatterns = [
        /₹\s*([\d,]+(?:\.\d{1,2})?)/g,
        /Rs\.?\s*([\d,]+(?:\.\d{1,2})?)/gi,
        /INR\s*([\d,]+(?:\.\d{1,2})?)/gi,
    ];
    let best = null;
    for (const pat of rupeePatterns) {
        let m;
        while ((m = pat.exec(text)) !== null) {
            const val = parseFloat(m[1].replace(/,/g, ''));
            if (!isNaN(val) && val > 0 && (best === null || val > best)) best = val;
        }
    }
    if (best !== null) return best;

    // Fee receipts: "TOTAL PAID AMOUNT : 91,000.00" or "Total Amount to Pay : 79,000"
    const totalPatterns = [
        /total\s+paid\s+amount\s*[(:)]\s*[₹Rs.]?\s*([\d,]+(?:\.\d{1,2})?)/i,
        /total\s+amount\s*[(:)]\s*[₹Rs.]?\s*([\d,]+(?:\.\d{1,2})?)/i,
        /amount\s+paid\s*[(:)]\s*[₹Rs.]?\s*([\d,]+(?:\.\d{1,2})?)/i,
        /grand\s+total\s*[(:)]\s*[₹Rs.]?\s*([\d,]+(?:\.\d{1,2})?)/i,
        /net\s+payable\s*[(:)]\s*[₹Rs.]?\s*([\d,]+(?:\.\d{1,2})?)/i,
        /total\s*[(:)]\s*[₹Rs.]?\s*([\d,]+(?:\.\d{1,2})?)/i,
    ];
    for (const pat of totalPatterns) {
        const m = text.match(pat);
        if (m) {
            const val = parseFloat(m[1].replace(/,/g, ''));
            if (!isNaN(val) && val > 0) return val;
        }
    }

    // Generic fallback: biggest number in document
    const nums = [...text.matchAll(/([\d,]{3,}(?:\.\d{1,2})?)/g)]
        .map(m => parseFloat(m[1].replace(/,/g, '')))
        .filter(n => !isNaN(n) && n > 0 && n < 10000000);
    if (nums.length) return Math.max(...nums);

    return null;
}

function extractVendor(text) {
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 1);

    // Skip common noise lines
    const skipWords = /^(cash memo|receipt|invoice|bill|tax invoice|gstin|date|mobile|mob:|phone|tel:|www\.|http|upi|gpay|google|pay|completed|from:|to:|amount|total|thank)/i;

    // Look for institute/company name — usually ALL CAPS or Title Case line
    for (const line of lines.slice(0, 8)) {
        if (skipWords.test(line)) continue;
        if (line.length >= 4 && line.length <= 60) {
            // Prefer ALL CAPS lines (company names)
            if (line === line.toUpperCase() && /[A-Z]/.test(line)) return line;
        }
    }

    // First meaningful non-noise line
    for (const line of lines.slice(0, 6)) {
        if (!skipWords.test(line) && line.length >= 3 && line.length <= 60) return line;
    }

    return lines[0] || null;
}

function extractDate(text) {
    const patterns = [
        /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/,
        /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})/i,
        /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/i,
        /DATE\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i,
    ];
    for (const pat of patterns) {
        const m = text.match(pat);
        if (m) {
            try { const d = new Date(m[1] || m[0]); if (!isNaN(d)) return d; } catch(e) {}
        }
    }
    return null;
}

module.exports = { performOCR };
