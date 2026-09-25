# DISHA (दिशा) - Multilingual Citizen Services & AI Helpdesk
### National Digital Public Services Navigator & Multilingual AI Knowledge Platform

**DISHA** is a production-grade full-stack platform engineered to make public citizen services universally accessible across **14 Indian languages** (Telugu, Hindi, Tamil, English, Assamese, Urdu, Malayalam, Sanskrit, Bengali, Odia, Punjabi, Gujarati, Marathi, and Kannada) and **15 core public citizen service sectors**.

---

## 🌟 Key Features

1. **Multilingual AI Citizen Helpdesk (Disha AI)**:
   - Natural Language Understanding across 14 official languages and regional scripts.
   - Intelligent intent classification mapping colloquial citizen queries to official procedures, required documents checklists, timelines, fees, and government authorities.
   - Text-to-Speech (TTS) audio narration for accessible voice assistance.
   - Voice search microphone (Speech-to-Text via Web Speech API).

2. **15 Comprehensive Civic Services Directory**:
   - Vital Records: *Birth Certificate, Death Certificate*
   - Civic Utilities: *Water Bill, Electricity Bill, Property Tax*
   - Transport & Identity: *Driving Licence, Passport, Voter ID*
   - Welfare & Revenue: *Ration Card, Income Certificate, Community/Caste Certificate, Residence/Domicile Certificate, Government Schemes*
   - Grievance & Tracking: *Complaint Registration (CPGRAMS), Application Status Verification*

3. **Live Application & Grievance Tracker**:
   - Real-time step-by-step timeline visualization: *Submitted -> Inward Review -> Field Verification -> Under Approval -> Dispatched*.
   - Direct citizen grievance and service application filing desk with automatic tracking ID generation.

4. **Interactive 3,000 Questions Dataset Explorer**:
   - Full live database browser with pagination, real-time search, language filters, and intent category filters.
   - One-click "Test Query" button linking questions directly into Disha AI engine.
   - Direct CSV and JSON export endpoints.

5. **Accessibility & Modern Design**:
   - Dual Theme (Dark / Light) with high-contrast mode for visually impaired citizens.
   - Multi-tier typography sizing (A-, A, A+) and responsive mobile-first glassmorphic UI.

---

## 🛠️ Technology Architecture

- **Backend**: Node.js & Express.js REST API
- **Data Engine**: High-performance in-memory indexing with 3,000 multilingual Q&A records
- **Frontend**: Modern Vanilla HTML5, CSS3 Custom Tokens, Modern ES6+ JavaScript
- **Icons & Fonts**: FontAwesome 6, Google Fonts (Plus Jakarta Sans & Outfit)
- **Audio & Voice**: Web Speech Synthesis API & Web Speech Recognition API

---

## 🚀 How to Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Server**:
   ```bash
   npm start
   # or
   node server.js
   ```

3. **Open Browser**:
   Navigate to:
   ```
   http://localhost:3000
   ```

---

## 📡 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health, operational metrics, record counts |
| `GET` | `/api/languages` | Supported languages with native script & query counts |
| `GET` | `/api/services` | 15 official services metadata, requirements, and steps |
| `GET` | `/api/services/:name` | Deep dive into a specific civic service category |
| `POST` | `/api/query` | Multilingual AI query resolution & intent prediction |
| `GET` | `/api/records` | Paginated dataset records with filtering and search |
| `POST` | `/api/applications/track` | Track application by reference ID |
| `POST` | `/api/applications/submit` | Register new application or civic grievance |
| `GET` | `/api/stats` | Analytics data for charts and dashboard counters |
| `GET` | `/data/dataset.csv` | Raw 3,000-row CSV download |
| `GET` | `/data/records.json` | Full structured JSON database download |
