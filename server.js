const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

// Load datasets
let records = [];
let servicesInfo = {};

try {
  const recordsPath = path.join(__dirname, 'data', 'records.json');
  if (fs.existsSync(recordsPath)) {
    records = JSON.parse(fs.readFileSync(recordsPath, 'utf8'));
    console.log(`Loaded ${records.length} records successfully.`);
  }
} catch (e) {
  console.error("Error loading records.json:", e);
}

try {
  const servicesPath = path.join(__dirname, 'data', 'services_info.json');
  if (fs.existsSync(servicesPath)) {
    servicesInfo = JSON.parse(fs.readFileSync(servicesPath, 'utf8'));
    console.log(`Loaded ${Object.keys(servicesInfo).length} services metadata.`);
  }
} catch (e) {
  console.error("Error loading services_info.json:", e);
}

// In-memory applications store
const applicationsStore = [
  {
    id: "DSH-8492-710",
    service: "Passport",
    applicantName: "Aarav Sharma",
    language: "Hindi",
    status: "In Progress",
    stage: 3,
    submittedAt: "2026-09-20T10:30:00Z",
    history: [
      { step: "Application Submitted", date: "2026-09-20", completed: true },
      { step: "Document Verification", date: "2026-09-22", completed: true },
      { step: "Police Verification Pending", date: "2026-09-24", completed: false },
      { step: "Passport Printing & Dispatch", date: "Estimated 2026-09-28", completed: false }
    ]
  },
  {
    id: "DSH-3104-582",
    service: "Water Bill",
    applicantName: "Lakshmi Narayanan",
    language: "Tamil",
    status: "Resolved",
    stage: 4,
    submittedAt: "2026-09-18T14:15:00Z",
    history: [
      { step: "Payment Initiated", date: "2026-09-18", completed: true },
      { step: "BBPS Gateway Cleared", date: "2026-09-18", completed: true },
      { step: "Water Board Ledger Updated", date: "2026-09-19", completed: true },
      { step: "Official e-Receipt Issued", date: "2026-09-19", completed: true }
    ]
  },
  {
    id: "DSH-9921-404",
    service: "Ration Card",
    applicantName: "Priyanka Patel",
    language: "Gujarati",
    status: "Under Review",
    stage: 2,
    submittedAt: "2026-09-23T09:00:00Z",
    history: [
      { step: "Application Received", date: "2026-09-23", completed: true },
      { step: "Inspector Field Verification", date: "In Progress", completed: false },
      { step: "Family Biometric Linkage", date: "Pending", completed: false },
      { step: "Digital Ration Card Generation", date: "Pending", completed: false }
    ]
  }
];

// Language metadata mapping
const languageMeta = {
  "Telugu": { native: "తెలుగు", code: "te", flag: "🇮🇳" },
  "Hindi": { native: "हिन्दी", code: "hi", flag: "🇮🇳" },
  "Tamil": { native: "தமிழ்", code: "ta", flag: "🇮🇳" },
  "English": { native: "English", code: "en", flag: "🌐" },
  "Assamese": { native: "অসমীয়া", code: "as", flag: "🇮🇳" },
  "Urdu": { native: "اردو", code: "ur", flag: "🇮🇳" },
  "Malayalam": { native: "മലയാളം", code: "ml", flag: "🇮🇳" },
  "Sanskrit": { native: "संस्कृतम्", code: "sa", flag: "🇮🇳" },
  "Bengali": { native: "বাংলা", code: "bn", flag: "🇮🇳" },
  "Odia": { native: "ଓଡ଼ିଆ", code: "or", flag: "🇮🇳" },
  "Punjabi": { native: "ਪੰਜਾਬੀ", code: "pa", flag: "🇮🇳" },
  "Gujarati": { native: "ગુજરાતી", code: "gu", flag: "🇮🇳" },
  "Marathi": { native: "मराठी", code: "mr", flag: "🇮🇳" },
  "Kannada": { native: "ಕನ್ನಡ", code: "kn", flag: "🇮🇳" }
};

// Keyword mapping dictionary for intelligent fallback intent prediction
const intentKeywords = {
  "Water Bill": ["water", "पानी", "जल", "জল", "পানী", "पाणी", "પાણી", "ਨੀਰ", "నీటి", "ನೀರಿನ", "വെള്ളം", "தண்ணீர்", "जलशुल्क"],
  "Electricity Bill": ["electricity", "power", "बिजली", "विद्युत", "বিদ্যুৎ", "વીજળી", "वीज", "కరెంట్", "ವಿದ್ಯುತ್", "വൈദ്യുതി", "மின்சாரம்", "ବିଦ୍ୟୁତ", "ਬਿਜਲੀ"],
  "Passport": ["passport", "पासपोर्ट", "পাসপোর্ট", "પાછপ'ৰ্ট", "પાસપોર્ટ", "ಪಾಸ್‌ಪೋರ್ಟ್", "പാസ്‌പോർട്ട്", "பாஸ்போர்ட்", "పాస్‌పోర్ట్", "ପାସପୋର୍ଟ", "पारपत्र"],
  "Driving Licence": ["driving", "licence", "license", "ड्राइविंग", "लाइसेंस", "लायसन्स", "ড্রাইভিং", "ડ્રાઇવિંગ", "ಚಾಲನಾ", "ഡ്രൈവിംഗ്", "ஓட்டுநர்", "డ్రైవింగ్", "ଡ୍ରାଇଭିଂ", "ਚਾਲਨਾనుඥా"],
  "Birth Certificate": ["birth", "जन्म", "প্ৰমাণপত্ৰ", "জন্ম", "જન્મ", "ಜನನ", "ജനന", "பிறப்பு", "జనన", "ଜନ୍ମ", "ਜਨਮ", "پیدائش"],
  "Death Certificate": ["death", "मृत्यु", "মৌਤ", "ಮರಣ", "മരണ", "இறப்பு", "మరణ", "ମୃତ୍ୟୁ", "وفات"],
  "Ration Card": ["ration", "राशन", "রেশন", "ৰেচন", "રેશન", "ಪಡಿತರ", "റേഷൻ", "ரேஷன்", "రేషన్", "ରାସନ", "ਰਾਸ਼ਨ", "راشن"],
  "Income Certificate": ["income", "आय", "আয়", "আৱক", "આવક", "ಆದಾಯ", "வருமானம்", "ఆదాయ", "ଆୟ", "ਆਮਦਨ", "آمدنی", "उत्पन्न"],
  "Residence Certificate": ["residence", "domicile", "निवास", "বাসস্থান", "રહેઠાણ", "ನಿವಾಸ", "താമസ", "குடியிருப்பு", "నివాస", "ବାସସ୍ଥାନ", "ਰਿਹਾਇਸ਼", "رہائشی", "रहिवासी"],
  "Community Certificate": ["community", "caste", "जाति", "समुदाय", "সম্প্ৰদায়", "সಮುದાય", "ಸಮುದಾಯ", "സമുദായ", "சமூக", "సమాజ", "ସମ୍ପ୍ରଦାୟ", "ਭਾਈਚਾਰਾ", "برادری"],
  "Voter ID": ["voter", "epic", "वोटर", "ভোটাৰ", "मतदार", "મતદાર", "ಮತದಾರ", "വോട്ടർ", "வாக்காளர்", "ఓటర్", "ଭୋଟର", "ਵੋਟਰ", "ووٹر"],
  "Property Tax": ["property", "tax", "संपत्ति कर", "मालमत्ता", "সম্পত্তি", "મિલકત", "ಆಸ್ತಿ ತೆರಿಗೆ", "വസ്തു നികുതി", "சொத்து வரி", "ఆస్తి పన్ను", "ସମ୍ପତ୍ତି କର", "ਪ੍ਰਾਪਰਟੀ ਟੈਕਸ", "پراپرٹی ٹیکس"],
  "Application Status": ["status", "track", "स्थिति", "অবস্থা", "ಸ್ಥಿತಿ", "നില", "நிலை", "ਸਥਿਤੀ", "حیثیت"],
  "Complaint Registration": ["complaint", "grievance", "शिकायत", "অভিযোগ", "તકરાર", "ફરિયાદ", "ದೂರು", "പരാതി", "புகார்", "ఫిర్యాదు", "ଅଭିଯୋଗ", "ਸ਼ਿਕਾਇਤ"],
  "Government Schemes": ["scheme", "yojana", "योजना", "প্রকল্প", "আঁচনি", "યોજના", "ಯೋಜನೆ", "പദ്ധതി", "திட்டம்", "పథకాలు", "ଯୋଜନା", "ਯੋਜਨਾਵਾਂ", "اسکیمیں"]
};

// ================= API ENDPOINTS =================

// 1. Health check & System info
app.get('/api/health', (req, res) => {
  res.json({
    status: "operational",
    service: "DISHA - Multilingual Citizen Services AI Helpdesk",
    version: "2.4.0",
    totalRecords: records.length,
    languagesCount: Object.keys(languageMeta).length,
    servicesCount: Object.keys(servicesInfo).length,
    timestamp: new Date().toISOString()
  });
});

// 2. Languages metadata
app.get('/api/languages', (req, res) => {
  const langCounts = {};
  records.forEach(r => {
    langCounts[r.language] = (langCounts[r.language] || 0) + 1;
  });

  const result = Object.entries(languageMeta).map(([name, meta]) => ({
    name,
    native: meta.native,
    code: meta.code,
    flag: meta.flag,
    count: langCounts[name] || 0
  }));

  res.json({ success: true, languages: result });
});

// 3. Services list
app.get('/api/services', (req, res) => {
  const list = Object.entries(servicesInfo).map(([name, info]) => ({
    name,
    ...info,
    datasetQuestionsCount: records.filter(r => r.intent === name).length
  }));
  res.json({ success: true, services: list });
});

// 4. Service detail by name
app.get('/api/services/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const info = servicesInfo[name];
  if (!info) {
    return res.status(404).json({ success: false, message: "Service category not found" });
  }

  // sample questions in different languages
  const sampleQuestions = records.filter(r => r.intent === name).slice(0, 10);

  res.json({
    success: true,
    service: {
      name,
      ...info,
      samples: sampleQuestions
    }
  });
});

// 5. Intelligent Query Matcher / AI Citizen Assistant
app.post('/api/query', (req, res) => {
  const { query, language } = req.body;

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ success: false, message: "Query text is required" });
  }

  const cleanQuery = query.trim().toLowerCase();

  // Search exact or high-overlap questions in dataset
  let bestMatch = null;
  let highestScore = 0;

  for (const record of records) {
    const qText = record.question.toLowerCase();
    
    // Direct substring or exact match
    if (qText === cleanQuery) {
      bestMatch = record;
      highestScore = 1.0;
      break;
    }

    if (qText.includes(cleanQuery) || cleanQuery.includes(qText)) {
      const score = 0.85;
      if (score > highestScore) {
        highestScore = score;
        bestMatch = record;
      }
    }

    // Token overlap
    const qTokens = new Set(qText.split(/[\s,?.!।॥؟-]+/).filter(t => t.length > 1));
    const userTokens = cleanQuery.split(/[\s,?.!।॥؟-]+/).filter(t => t.length > 1);
    
    if (userTokens.length > 0) {
      let matches = 0;
      userTokens.forEach(t => {
        if (qTokens.has(t)) matches++;
      });
      const overlap = matches / Math.max(qTokens.size, userTokens.length);
      if (overlap > highestScore && overlap > 0.3) {
        highestScore = overlap;
        bestMatch = record;
      }
    }
  }

  // Keyword intent fallback
  let detectedIntent = bestMatch ? bestMatch.intent : null;
  if (!detectedIntent || highestScore < 0.4) {
    for (const [intent, keywords] of Object.entries(intentKeywords)) {
      for (const kw of keywords) {
        if (cleanQuery.includes(kw.toLowerCase())) {
          detectedIntent = intent;
          highestScore = Math.max(highestScore, 0.65);
          break;
        }
      }
      if (detectedIntent) break;
    }
  }

  // Default intent fallback if query matches common public requests
  if (!detectedIntent) {
    detectedIntent = "Application Status";
    highestScore = 0.35;
  }

  const serviceData = servicesInfo[detectedIntent] || {
    authority: "Official Government Portal / Citizen Center",
    documents: ["Valid Identity Proof", "Address Proof"],
    steps: ["Visit the jurisdictional portal", "Submit your online request", "Track status online"],
    timeline: "3 to 15 days",
    fee: "Refer to official portal",
    portal_url: "https://services.india.gov.in"
  };

  // Find 3 related questions from the dataset in the same or matching language
  const relatedQueries = records
    .filter(r => r.intent === detectedIntent && (!language || r.language === language))
    .slice(0, 3)
    .map(r => ({
      question: r.question,
      language: r.language,
      answer: r.answer
    }));

  const officialAnswer = bestMatch 
    ? bestMatch.answer 
    : `Use the relevant ${serviceData.authority} or official citizen service portal for ${detectedIntent}.`;

  res.json({
    success: true,
    query: query.trim(),
    detectedIntent,
    confidence: Math.min(Math.round((highestScore || 0.75) * 100), 98),
    matchedQuestion: bestMatch ? bestMatch.question : null,
    matchedLanguage: bestMatch ? bestMatch.language : (language || "Universal"),
    answer: officialAnswer,
    serviceDetails: {
      category: serviceData.category || "Public Citizen Services",
      authority: serviceData.authority,
      documents: serviceData.documents,
      steps: serviceData.steps,
      timeline: serviceData.timeline,
      fee: serviceData.fee,
      portal_url: serviceData.portal_url
    },
    relatedQueries
  });
});

// 6. Dataset records with search & pagination
app.get('/api/records', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const language = req.query.language;
  const intent = req.query.intent;
  const search = req.query.search ? req.query.search.trim().toLowerCase() : '';

  let filtered = records;

  if (language && language !== 'All') {
    filtered = filtered.filter(r => r.language.toLowerCase() === language.toLowerCase());
  }

  if (intent && intent !== 'All') {
    filtered = filtered.filter(r => r.intent.toLowerCase() === intent.toLowerCase());
  }

  if (search) {
    filtered = filtered.filter(r => 
      r.question.toLowerCase().includes(search) || 
      r.intent.toLowerCase().includes(search) || 
      r.language.toLowerCase().includes(search) ||
      r.answer.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginated = filtered.slice(startIndex, startIndex + limit);

  res.json({
    success: true,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
    records: paginated
  });
});

// 7. Track Application
app.post('/api/applications/track', (req, res) => {
  const { trackingId } = req.body;
  if (!trackingId || !trackingId.trim()) {
    return res.status(400).json({ success: false, message: "Tracking ID is required" });
  }

  const cleanId = trackingId.trim().toUpperCase();
  const existing = applicationsStore.find(a => a.id.toUpperCase() === cleanId);

  if (existing) {
    return res.json({ success: true, application: existing });
  }

  // Generate realistic simulated status for any input tracking ID so users can test any ID
  const servicesKeys = Object.keys(servicesInfo);
  const randomService = servicesKeys[Math.abs(cleanId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % servicesKeys.length];
  
  const generatedApp = {
    id: cleanId,
    service: randomService,
    applicantName: "Registered Citizen",
    language: "Multilingual Verified",
    status: "In Progress",
    stage: 2,
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    history: [
      { step: "Application Inwarded & Registered", date: "3 days ago", completed: true },
      { step: "Document Scrutiny & Verification", date: "Yesterday", completed: true },
      { step: "Field Assessment / Departmental Approval", date: "In Progress", completed: false },
      { step: "Certificate Issuance / Service Delivery", date: "Estimated in 3-5 days", completed: false }
    ]
  };

  res.json({ success: true, application: generatedApp, simulated: true });
});

// 8. Submit new Application / Grievance
app.post('/api/applications/submit', (req, res) => {
  const { service, applicantName, mobile, email, language, details } = req.body;

  if (!service || !applicantName) {
    return res.status(400).json({ success: false, message: "Service and applicant name are required" });
  }

  const trackingId = `DSH-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`;

  const newApp = {
    id: trackingId,
    service,
    applicantName,
    mobile: mobile || "Not provided",
    email: email || "Not provided",
    language: language || "English",
    details: details || "New citizen service request",
    status: "Submitted",
    stage: 1,
    submittedAt: new Date().toISOString(),
    history: [
      { step: "Application Submitted Successfully", date: new Date().toLocaleDateString(), completed: true },
      { step: "Departmental Verification", date: "Within 24-48 hours", completed: false },
      { step: "Officer Approval & Inspection", date: "Pending", completed: false },
      { step: "Resolution & Certificate Ready", date: "Pending", completed: false }
    ]
  };

  applicationsStore.unshift(newApp);

  res.json({
    success: true,
    message: "Application submitted successfully",
    trackingId,
    application: newApp
  });
});

// 9. Analytics & Stats
app.get('/api/stats', (req, res) => {
  const langCounts = {};
  const intentCounts = {};

  records.forEach(r => {
    langCounts[r.language] = (langCounts[r.language] || 0) + 1;
    intentCounts[r.intent] = (intentCounts[r.intent] || 0) + 1;
  });

  res.json({
    success: true,
    stats: {
      totalRecords: records.length,
      languagesCount: Object.keys(langCounts).length,
      servicesCount: Object.keys(intentCounts).length,
      averageResolutionTime: "4.2 days",
      satisfactionRate: "98.6%",
      languageBreakdown: langCounts,
      intentBreakdown: intentCounts
    }
  });
});

// Fallback to index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`  DISHA - Citizen Services Server Running!     `);
  console.log(`  URL: http://localhost:${PORT}                `);
  console.log(`  Records Loaded: ${records.length}            `);
  console.log(`===============================================`);
});
