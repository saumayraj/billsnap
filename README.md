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

## Deployment

### Vercel

1. Install the Vercel CLI if you want to deploy from your machine:
```bash
npm install -g vercel
```
2. Run the deployment command from the project root:
```bash
vercel --prod
```
3. In the Vercel dashboard for this project, add these environment variables:
- `MONGODB_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`

You can also use `.env.example` as the template for your local environment.

### GitHub + Vercel Continuous Deployment

This repository is ready for GitHub-based deployment using a GitHub Actions workflow. Push your code to GitHub, then set these repository secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

The workflow at `.github/workflows/vercel-deploy.yml` will deploy to Vercel automatically on pushes to `main`.

### Offline / Local Use

This app now includes a local `vendor/jspdf.umd.min.js` bundle so PDF generation works without internet access.

To run locally without network access:
1. Install dependencies once with:
```bash
npm install
```
2. Start the backend server locally:
```bash
npm run dev
```
3. Open the app in your browser at `http://localhost:8080`.

If you only need local scanning and PDF export, the frontend can also open directly from `index.html` in a browser without CDN access. Backend features such as login, expense tracking, and cloud save still require a local server.

## License
MIT

## Author
BillSnap Team
