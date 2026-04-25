# BillSnap Pro

**Scan Bills into Clean PDFs — with OCR, Expense Tracking & Cloud Storage**

Upload bill photos, auto-crop & enhance them, generate scanner-quality PDFs, and track your expenses — all in one app.

## Features
- 📸 Drag & drop multiple bill photos
- 👁️ Live preview with auto-crop & enhancement (Otsu thresholding)
- 📄 Instant PDF generation (in-browser, no backend needed for basic use)
- 🔐 User authentication (JWT-based register/login)
- 🧠 OCR text extraction (Tesseract.js) — reads vendor, amount, date
- 💰 Expense tracking with categories, tags, and date filtering
- 📊 Expense summaries by daily / weekly / monthly / yearly period
- 📧 Email integration (Nodemailer)
- ☁️ Cloud storage support (Google Drive OAuth)
- 🚀 Vercel-ready deployment

## Tech Stack
- **Frontend:** HTML5, CSS3 (Glassmorphism), Vanilla JS, jsPDF, Canvas API
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcryptjs
- **OCR:** Tesseract.js
- **PDF:** pdf-lib
- **Email:** Nodemailer

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your values in .env
```

### 3. Run locally
```bash
npm run dev
```
Frontend: http://localhost:8080  
Backend API: http://localhost:5000

## API Routes
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/users/register | Register new user |
| POST | /api/users/login | Login |
| GET | /api/users/me | Get current user |
| POST | /api/bills/upload | Upload & OCR bills |
| GET | /api/bills | Get all user bills |
| PATCH | /api/bills/:id | Update bill |
| DELETE | /api/bills/:id | Delete bill |
| POST | /api/bills/generate-pdf | Generate PDF from saved bills |
| GET | /api/expenses | Get expenses (filterable) |
| GET | /api/expenses/summary/:period | Expense summary |

## Deployment (Vercel)
```bash
npm i -g vercel
vercel
```
Set environment variables in Vercel dashboard matching `.env.example`.

## License
MIT

## Author
BillSnap Team
