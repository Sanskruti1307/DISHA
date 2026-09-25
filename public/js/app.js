// DISHA - Client Application Logic

// State
let allServices = [];
let allLanguages = [];
let currentCategory = 'All';
let currentLangFilter = 'All';
let currentIntentFilter = 'All';
let currentSearchTerm = '';
let currentPage = 1;
const limit = 15;
let currentAnswerText = '';

// DOM Elements
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

async function initApp() {
  setupThemeAndAccessibility();
  setupVoiceRecognition();
  setupEventListeners();
  await loadStats();
  await loadLanguages();
  await loadServices();
  await loadDatasetRecords();
}

// 1. Accessibility & Theme Toggle
function setupThemeAndAccessibility() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const currentTheme = localStorage.getItem('disha_theme') || 'light';
  document.body.setAttribute('data-theme', currentTheme);
  updateThemeIcon(currentTheme);

  themeBtn.addEventListener('click', () => {
    const nextTheme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', nextTheme);
    localStorage.setItem('disha_theme', nextTheme);
    updateThemeIcon(nextTheme);
  });

  // Font resizing
  let fontSizePercent = 100;
  document.getElementById('fontIncBtn').addEventListener('click', () => {
    if (fontSizePercent < 130) {
      fontSizePercent += 5;
      document.documentElement.style.fontSize = fontSizePercent + '%';
    }
  });

  document.getElementById('fontDecBtn').addEventListener('click', () => {
    if (fontSizePercent > 85) {
      fontSizePercent -= 5;
      document.documentElement.style.fontSize = fontSizePercent + '%';
    }
  });

  document.getElementById('fontResetBtn').addEventListener('click', () => {
    fontSizePercent = 100;
    document.documentElement.style.fontSize = '100%';
  });

  // Contrast toggle
  document.getElementById('contrastBtn').addEventListener('click', () => {
    document.body.classList.toggle('high-contrast');
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#themeToggleBtn i');
  if (!icon) return;
  if (theme === 'dark') {
    icon.className = 'fa-solid fa-sun';
  } else {
    icon.className = 'fa-solid fa-moon';
  }
}

// 2. Load Stats
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    if (data.success) {
      document.getElementById('statRecords').innerText = data.stats.totalRecords.toLocaleString();
      document.getElementById('statLanguages').innerText = data.stats.languagesCount;
      document.getElementById('statServices').innerText = data.stats.servicesCount;
      document.getElementById('statResolution').innerText = data.stats.satisfactionRate;
    }
  } catch (err) {
    console.error("Error loading stats:", err);
  }
}

// 3. Load Languages
async function loadLanguages() {
  try {
    const res = await fetch('/api/languages');
    const data = await res.json();
    if (data.success) {
      allLanguages = data.languages;
      populateLanguageDropdowns(data.languages);
    }
  } catch (err) {
    console.error("Error loading languages:", err);
  }
}

function populateLanguageDropdowns(languages) {
  const tableLangSelect = document.getElementById('tableLangFilter');
  tableLangSelect.innerHTML = `<option value="All">All Languages (${languages.length})</option>`;
  
  languages.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.name;
    opt.textContent = `${l.flag} ${l.name} (${l.native})`;
    tableLangSelect.appendChild(opt);
  });
}

// 4. Load Services
async function loadServices() {
  try {
    const res = await fetch('/api/services');
    const data = await res.json();
    if (data.success) {
      allServices = data.services;
      renderServicesGrid(allServices);
      populateIntentDropdown(allServices);
    }
  } catch (err) {
    console.error("Error loading services:", err);
  }
}

function populateIntentDropdown(services) {
  const intentSelect = document.getElementById('tableIntentFilter');
  intentSelect.innerHTML = `<option value="All">All Intents (${services.length})</option>`;
  services.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.name;
    intentSelect.appendChild(opt);
  });
}

function renderServicesGrid(services) {
  const grid = document.getElementById('servicesGrid');
  grid.innerHTML = '';

  const filtered = services.filter(s => {
    if (currentCategory === 'All') return true;
    if (currentCategory === 'Vital Records') return s.category.includes('Vital');
    if (currentCategory === 'Utilities') return s.category.includes('Utilities') || s.category.includes('Power');
    if (currentCategory === 'Welfare') return s.category.includes('Welfare') || s.category.includes('Revenue') || s.category.includes('Civil Supplies');
    if (currentCategory === 'Transport') return s.category.includes('Transport') || s.category.includes('Electoral') || s.category.includes('External');
    return true;
  });

  filtered.forEach(service => {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.onclick = () => openServiceModal(service.name);

    card.innerHTML = `
      <div class="service-card-top">
        <div class="service-icon-box">
          <i class="fa-solid ${service.icon || 'fa-landmark'}"></i>
        </div>
        <div class="service-category-tag">${service.category}</div>
        <h4>${service.name}</h4>
        <p class="service-desc">${service.description}</p>
      </div>
      <div class="service-card-bottom">
        <span class="service-meta-text"><i class="fa-solid fa-clock"></i> ${service.timeline}</span>
        <span class="service-action-link">View Details <i class="fa-solid fa-arrow-right"></i></span>
      </div>
    `;

    grid.appendChild(card);
  });
}

// 5. Service Detail Modal
function openServiceModal(serviceName) {
  const service = allServices.find(s => s.name === serviceName);
  if (!service) return;

  const modal = document.getElementById('serviceModal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');

  title.innerHTML = `<i class="fa-solid ${service.icon || 'fa-landmark'}"></i> ${service.name}`;

  body.innerHTML = `
    <div style="margin-bottom: 20px;">
      <span class="service-category-tag" style="font-size: 0.8rem;">${service.category}</span>
      <p style="font-size: 1.05rem; color: var(--text-main); margin-top: 6px; line-height: 1.5;">${service.description}</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; background: var(--bg-card-subtle); padding: 16px; border-radius: var(--radius-md);">
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Issuing Authority:</span>
        <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${service.authority}</div>
      </div>
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Timeline & Expected Fee:</span>
        <div style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${service.timeline} • ${service.fee}</div>
      </div>
    </div>

    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-file-circle-check"></i> Required Documents Checklist
      </h4>
      <ul style="list-style: none; padding: 0;">
        ${service.documents.map(doc => `
          <li style="padding: 6px 0; font-size: 0.9rem; color: var(--text-muted); display: flex; align-items: center; gap: 10px;">
            <i class="fa-solid fa-square-check" style="color: var(--success);"></i> ${doc}
          </li>
        `).join('')}
      </ul>
    </div>

    <div style="margin-bottom: 24px;">
      <h4 style="font-size: 1rem; color: var(--primary); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-list-ol"></i> Step-by-Step Procedure
      </h4>
      <ol style="padding-left: 20px; font-size: 0.9rem; color: var(--text-muted); line-height: 1.6;">
        ${service.steps.map(step => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
      </ol>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 20px;">
      <button class="test-query-btn" onclick="testQueryFromService('${service.name}')" style="padding: 10px 18px;">
        <i class="fa-solid fa-wand-magic-sparkles"></i> Ask Disha AI about this
      </button>

      <a href="${service.portal_url}" target="_blank" rel="noopener" class="portal-link-btn">
        <span>Direct Portal Application</span> <i class="fa-solid fa-arrow-up-right-from-square"></i>
      </a>
    </div>
  `;

  modal.classList.add('active');
}

function closeServiceModal() {
  document.getElementById('serviceModal').classList.remove('active');
}

function testQueryFromService(serviceName) {
  closeServiceModal();
  const input = document.getElementById('heroSearchInput');
  input.value = `How to apply for ${serviceName}?`;
  triggerAIQuery(input.value);
  window.scrollTo({ top: 300, behavior: 'smooth' });
}

// 6. AI Query Engine Integration
async function triggerAIQuery(queryText, language) {
  if (!queryText || !queryText.trim()) return;

  const resultSection = document.getElementById('aiResultSection');
  const answerText = document.getElementById('resAnswerText');
  const intentName = document.getElementById('resIntentName');
  const confidence = document.getElementById('resConfidence');
  const matchedLang = document.getElementById('resLang');
  const docsList = document.getElementById('resDocsList');
  const stepsList = document.getElementById('resStepsList');
  const relatedList = document.getElementById('resRelatedList');
  const authority = document.getElementById('resAuthority');
  const portalBtn = document.getElementById('resPortalBtn');

  // Show loading state
  resultSection.style.display = 'block';
  answerText.innerText = "Analyzing citizen query with DISHA Natural Language Matcher...";
  intentName.innerText = "Detecting...";
  confidence.innerText = "--";

  try {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryText, language })
    });

    const data = await res.json();
    if (data.success) {
      currentAnswerText = data.answer;
      answerText.innerText = data.answer;
      intentName.innerText = data.detectedIntent;
      confidence.innerText = data.confidence + '%';
      matchedLang.innerText = data.matchedLanguage;
      authority.innerText = data.serviceDetails.authority;
      portalBtn.href = data.serviceDetails.portal_url;

      // Populate docs
      docsList.innerHTML = (data.serviceDetails.documents || []).map(d => `
        <li><i class="fa-solid fa-check"></i> <span>${d}</span></li>
      `).join('');

      // Populate steps
      stepsList.innerHTML = (data.serviceDetails.steps || []).map(s => `
        <li><i class="fa-solid fa-circle-arrow-right"></i> <span>${s}</span></li>
      `).join('');

      // Populate related
      if (data.relatedQueries && data.relatedQueries.length > 0) {
        relatedList.innerHTML = data.relatedQueries.map(r => `
          <div style="background: var(--bg-card-subtle); padding: 8px 12px; border-radius: 6px; font-size: 0.86rem; display: flex; justify-content: space-between; align-items: center;">
            <span><strong style="color: var(--primary);">${r.language}:</strong> ${r.question}</span>
            <button class="test-query-btn" style="padding: 2px 8px;" onclick="triggerAIQuery('${escapeHtml(r.question)}', '${r.language}')">Ask</button>
          </div>
        `).join('');
      } else {
        relatedList.innerHTML = `<span style="font-size: 0.85rem; color: var(--text-light);">No other related queries.</span>`;
      }

      // Smooth scroll to answer
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  } catch (err) {
    console.error("Error executing AI query:", err);
    answerText.innerText = "Could not fetch advice at this moment. Please check backend connection.";
  }
}

// 7. Text-to-Speech (TTS)
function speakText(text) {
  if (!('speechSynthesis' in window)) {
    alert("Text-to-Speech is not supported in this browser.");
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  // Prefer Indian English or Indian languages if available in browser speech synthesis
  const voices = window.speechSynthesis.getVoices();
  const indianVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi') || v.lang.includes('te'));
  if (indianVoice) {
    utterance.voice = indianVoice;
  }

  window.speechSynthesis.speak(utterance);
}

// 8. Voice Recognition (Speech to Text)
function setupVoiceRecognition() {
  const micBtn = document.getElementById('voiceMicBtn');
  const searchInput = document.getElementById('heroSearchInput');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    micBtn.title = "Voice recognition not supported in this browser.";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-IN'; // will adapt to input

  micBtn.addEventListener('click', () => {
    if (micBtn.classList.contains('listening')) {
      recognition.stop();
      micBtn.classList.remove('listening');
    } else {
      micBtn.classList.add('listening');
      recognition.start();
    }
  });

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    searchInput.value = transcript;
    micBtn.classList.remove('listening');
    triggerAIQuery(transcript);
  };

  recognition.onerror = () => {
    micBtn.classList.remove('listening');
  };

  recognition.onend = () => {
    micBtn.classList.remove('listening');
  };
}

// 9. Load Dataset Records (Table)
async function loadDatasetRecords() {
  try {
    const params = new URLSearchParams({
      page: currentPage,
      limit,
      language: currentLangFilter,
      intent: currentIntentFilter,
      search: currentSearchTerm
    });

    const res = await fetch(`/api/records?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      renderDatasetTable(data.records);
      document.getElementById('datasetTotalCount').innerText = data.total.toLocaleString();
      document.getElementById('pageInfoText').innerText = `Page ${data.page} of ${data.totalPages || 1}`;

      document.getElementById('prevPageBtn').disabled = data.page <= 1;
      document.getElementById('nextPageBtn').disabled = data.page >= data.totalPages;
    }
  } catch (err) {
    console.error("Error loading records:", err);
  }
}

function renderDatasetTable(records) {
  const tbody = document.getElementById('datasetTableBody');
  tbody.innerHTML = '';

  if (!records || records.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">No records found matching criteria.</td></tr>`;
    return;
  }

  records.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><span style="font-weight: 700; color: var(--text-muted);">#${r.id}</span></td>
      <td><strong>${escapeHtml(r.question)}</strong></td>
      <td><span class="badge-lang">${r.language}</span></td>
      <td><span class="badge-intent">${r.intent}</span></td>
      <td style="color: var(--text-muted); font-size: 0.85rem;">${escapeHtml(r.answer)}</td>
      <td>
        <button class="test-query-btn" onclick="testTableQuery('${escapeHtml(r.question)}', '${r.language}')" title="Test query with Disha AI">
          <i class="fa-solid fa-play"></i> Ask
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function testTableQuery(q, lang) {
  const input = document.getElementById('heroSearchInput');
  input.value = q;
  triggerAIQuery(q, lang);
  window.scrollTo({ top: 320, behavior: 'smooth' });
}

// 10. Track Application
async function trackApplication(trackingId) {
  const box = document.getElementById('trackerResultBox');
  box.innerHTML = `<div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin" style="font-size: 1.8rem; color: var(--primary);"></i><p style="margin-top: 10px;">Retrieving verification record...</p></div>`;

  try {
    const res = await fetch('/api/applications/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingId })
    });

    const data = await res.json();
    if (data.success) {
      const app = data.application;
      box.innerHTML = `
        <div style="background: var(--bg-card-subtle); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border); margin-top: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
            <div>
              <span style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--accent);">Official Tracking Record</span>
              <h4 style="font-size: 1.25rem; font-weight: 800; color: var(--primary);">${app.id}</h4>
              <span style="font-size: 0.88rem; color: var(--text-muted);">${app.service} • Applicant: ${app.applicantName}</span>
            </div>
            <div>
              <span class="badge-intent" style="font-size: 0.85rem; padding: 6px 14px; background: rgba(16, 185, 129, 0.15); color: var(--success);">
                <i class="fa-solid fa-circle-notch fa-spin"></i> Status: ${app.status}
              </span>
            </div>
          </div>

          <div class="timeline">
            ${app.history.map((h, i) => `
              <div class="timeline-step ${h.completed ? 'completed' : (i === app.stage ? 'active' : '')}">
                <div class="timeline-dot">
                  ${h.completed ? '<i class="fa-solid fa-check" style="font-size: 0.65rem; color: #fff;"></i>' : ''}
                </div>
                <div class="timeline-content">
                  <h5>${h.step}</h5>
                  <p>${h.date}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      box.innerHTML = `<p style="color: var(--danger); text-align: center; padding: 20px;">${data.message || 'Tracking ID not found.'}</p>`;
    }
  } catch (err) {
    console.error("Error tracking application:", err);
    box.innerHTML = `<p style="color: var(--danger); text-align: center; padding: 20px;">Could not connect to tracking server.</p>`;
  }
}

// 11. Submit New Application / Grievance
async function submitCitizenForm(event) {
  event.preventDefault();

  const service = document.getElementById('formService').value;
  const language = document.getElementById('formLanguage').value;
  const applicantName = document.getElementById('formName').value;
  const mobile = document.getElementById('formMobile').value;
  const details = document.getElementById('formDetails').value;

  try {
    const res = await fetch('/api/applications/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ service, language, applicantName, mobile, details })
    });

    const data = await res.json();
    if (data.success) {
      document.getElementById('newTrackId').innerText = data.trackingId;
      document.getElementById('submitSuccessCard').style.display = 'block';
      document.getElementById('trackInput').value = data.trackingId;
      document.getElementById('submitAppForm').reset();
      trackApplication(data.trackingId);
    }
  } catch (err) {
    console.error("Error submitting application:", err);
    alert("Submission error. Please ensure backend is operational.");
  }
}

function copyTrackingId() {
  const id = document.getElementById('newTrackId').innerText;
  navigator.clipboard.writeText(id).then(() => {
    alert("Tracking ID copied to clipboard: " + id);
  });
}

// 12. Floating Chat Drawer
function toggleChatWindow() {
  document.getElementById('chatWindow').classList.toggle('open');
}

function openAssistantModal() {
  toggleChatWindow();
  document.getElementById('chatInput').focus();
}

async function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if (!text) return;

  const messagesBox = document.getElementById('chatMessages');

  // Append user message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-msg user';
  userMsg.innerText = text;
  messagesBox.appendChild(userMsg);
  input.value = '';
  messagesBox.scrollTop = messagesBox.scrollHeight;

  // Append loading bot message
  const botMsg = document.createElement('div');
  botMsg.className = 'chat-msg bot';
  botMsg.innerText = "...";
  messagesBox.appendChild(botMsg);
  messagesBox.scrollTop = messagesBox.scrollHeight;

  try {
    const res = await fetch('/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: text })
    });
    const data = await res.json();
    if (data.success) {
      botMsg.innerHTML = `
        <strong>${data.detectedIntent} (${data.confidence}% confidence)</strong><br>
        ${data.answer}<br>
        <div style="margin-top: 8px;">
          <a href="${data.serviceDetails.portal_url}" target="_blank" style="color: var(--primary-light); font-weight: 700; text-decoration: underline;">Open Official Portal</a>
        </div>
      `;
    } else {
      botMsg.innerText = "I could not resolve this query. Please check with citizen support.";
    }
  } catch (err) {
    botMsg.innerText = "Error connecting to assistant service.";
  }
  messagesBox.scrollTop = messagesBox.scrollHeight;
}

// 13. Event Listeners Setup
function setupEventListeners() {
  // Hero Search Form
  document.getElementById('heroSearchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const query = document.getElementById('heroSearchInput').value.trim();
    triggerAIQuery(query);
  });

  // Query chips
  document.querySelectorAll('.query-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-q');
      const lang = chip.getAttribute('data-lang');
      document.getElementById('heroSearchInput').value = q;
      triggerAIQuery(q, lang);
    });
  });

  // TTS Button
  document.getElementById('ttsSpeakBtn').addEventListener('click', () => {
    if (currentAnswerText) {
      speakText(currentAnswerText);
    }
  });

  // Category filter tabs
  document.querySelectorAll('.filter-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-tabs .tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-category');
      renderServicesGrid(allServices);
    });
  });

  // Track Application Form
  document.getElementById('trackForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('trackInput').value.trim();
    trackApplication(id);
  });

  // Initial trigger for sample tracking ID
  trackApplication("DSH-8492-710");

  // Submit Application Form
  document.getElementById('submitAppForm').addEventListener('submit', submitCitizenForm);

  // Dataset Table search and filters
  let searchTimeout;
  document.getElementById('tableSearchInput').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearchTerm = e.target.value;
      currentPage = 1;
      loadDatasetRecords();
    }, 300);
  });

  document.getElementById('tableLangFilter').addEventListener('change', (e) => {
    currentLangFilter = e.target.value;
    currentPage = 1;
    loadDatasetRecords();
  });

  document.getElementById('tableIntentFilter').addEventListener('change', (e) => {
    currentIntentFilter = e.target.value;
    currentPage = 1;
    loadDatasetRecords();
  });

  document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadDatasetRecords();
    }
  });

  document.getElementById('nextPageBtn').addEventListener('click', () => {
    currentPage++;
    loadDatasetRecords();
  });

  // Top Lang Selector
  document.getElementById('topLangSelector').addEventListener('change', (e) => {
    const lang = e.target.value;
    document.getElementById('tableLangFilter').value = lang;
    currentLangFilter = lang;
    currentPage = 1;
    loadDatasetRecords();
  });

  // Chat Form
  document.getElementById('chatForm').addEventListener('submit', handleChatSubmit);

  // Close modal on background click
  document.getElementById('serviceModal').addEventListener('click', (e) => {
    if (e.target.id === 'serviceModal') {
      closeServiceModal();
    }
  });
}

// 14. Export Data Utility
function exportData(format) {
  if (format === 'csv') {
    window.open('/data/dataset.csv', '_blank');
  } else {
    window.open('/data/records.json', '_blank');
  }
}

// Helper: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
