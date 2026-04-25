const { PDFDocument, rgb } = require('pdf-lib');

async function generatePDF(bills) {
    try {
        const pdfDoc = await PDFDocument.create();
        
        for (const bill of bills) {
            const page = pdfDoc.addPage([612, 792]); // Standard letter size
            const { height } = page.getSize();
            
            // Add bill image to page
            let image;
            try {
                const imageBuffer = Buffer.from(bill.processedImage.split(',')[1], 'base64');
                image = await pdfDoc.embedPng(imageBuffer);
            } catch (e) {
                // Try as JPEG
                const imageBuffer = Buffer.from(bill.processedImage.split(',')[1], 'base64');
                image = await pdfDoc.embedJpg(imageBuffer);
            }
            
            const imageHeight = 750;
            const imageWidth = (imageHeight * image.width) / image.height;
            
            page.drawImage(image, {
                x: (612 - imageWidth) / 2,
                y: height - imageHeight - 20,
                width: imageWidth,
                height: imageHeight
            });
            
            // Add metadata
            page.drawText(`Vendor: ${bill.vendor || 'N/A'} | Amount: $${bill.amount || 'N/A'} | Date: ${bill.date ? new Date(bill.date).toLocaleDateString() : 'N/A'}`, {
                x: 20,
                y: 20,
                size: 10,
                color: rgb(0, 0, 0)
            });
        }
        
        const pdfBytes = await pdfDoc.save();
        return pdfBytes;
    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    }
}

module.exports = { generatePDF };
