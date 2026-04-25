const Tesseract = require('tesseract.js');

async function performOCR(imageData) {
    try {
        // Perform OCR
        const result = await Tesseract.recognize(
            imageData,
            'eng',
            { logger: m => console.log(m) }
        );
        
        const text = result.data.text;
        
        // Extract bill information
        const extractedData = {
            text: text,
            amount: extractAmount(text),
            vendor: extractVendor(text),
            date: extractDate(text),
            confidence: result.data.confidence
        };
        
        return extractedData;
    } catch (error) {
        console.error('OCR Error:', error);
        return {
            text: '',
            amount: null,
            vendor: null,
            date: null,
            error: error.message
        };
    }
}

function extractAmount(text) {
    const patterns = [
        /total\s*:?\s*\$?(\d+\.?\d*)/gi,
        /amount\s*:?\s*\$?(\d+\.?\d*)/gi,
        /\$(\d+\.?\d*)/g,
        /(\d+\.?\d*)\s*(dollars|usd)/gi
    ];
    
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const numberMatch = match[0].match(/\d+\.?\d*/);
            if (numberMatch) return parseFloat(numberMatch[0]);
        }
    }
    
    return null;
}

function extractVendor(text) {
    const lines = text.split('\n');
    // Usually vendor name is in the first few lines
    for (let i = 0; i < Math.min(5, lines.length); i++) {
        const line = lines[i].trim();
        if (line.length > 0 && line.length < 50) {
            return line;
        }
    }
    return null;
}

function extractDate(text) {
    const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})/;
    const match = text.match(datePattern);
    if (match) {
        try {
            return new Date(match[0]);
        } catch (e) {
            return null;
        }
    }
    return null;
}

module.exports = { performOCR };
