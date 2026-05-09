let current = null;

const categories = [
  { name: "Scheduling", words: ["appointment", "schedule", "calendar", "booking", "rescheduling", "no-show", "reminder", "receptionist", "patient coordinator"], idea: "Appointment intake + calendar booking + automatic reminders + missed-call follow-up" },
  { name: "Lead Follow-Up", words: ["lead", "follow up", "sales pipeline", "inbound", "prospect", "appointment setter", "crm", "quote request", "proposal"], idea: "Lead capture + CRM update + instant reply + automatic follow-up reminders" },
  { name: "Admin", words: ["administrative", "admin", "data entry", "spreadsheet", "excel", "google sheets", "copy", "records", "documents", "office manager"], idea: "Admin intake form + automatic spreadsheet/CRM updates + team notifications" },
  { name: "Customer Support", words: ["customer support", "customer service", "support tickets", "emails", "inquiries", "faq", "chat", "response time", "phone calls"], idea: "FAQ auto-reply/chatbot + ticket categorization + human handoff dashboard" },
  { name: "Invoice/Billing", words: ["invoice", "billing", "accounts receivable", "payment", "overdue", "bookkeeping", "receipts", "collections"], idea: "Invoice tracking + automatic payment reminders + accounts receivable dashboard" },
  { name: "Inventory", words: ["inventory", "stock", "warehouse", "fulfillment", "purchase order", "reorder", "stockout", "supply chain"], idea: "Inventory tracker + reorder alerts + operations dashboard" },
  { name: "Recruiting/HR", words: ["candidate", "recruiting", "interview", "applications", "onboarding", "screening", "new hire", "hr assistant"], idea: "Candidate intake + automatic screening + interview scheduling workflow" },
  { name: "Operations", words: ["operations", "workflow", "process", "manual", "bottleneck", "dispatch", "coordinator", "reports", "tracking"], idea: "Operations dashboard + automated task/status updates + alerts" }
];

function extractPage() {
  return {
    title: document.title,
    url: location.href,
    text: document.body.innerText.slice(0, 30000)
  };
}

function analyze(data) {
  const text = data.text || "";
  const lower = text.toLowerCase();
  const matches = categories.map(cat => {
    const found = cat.words.filter(w => lower.includes(w));
    return { ...cat, count: found.length, found };
  }).sort((a,b) => b.count - a.count);
  const best = matches[0];
  const second = matches[1];

  const jobSignals = ["responsibilities", "qualifications", "we are hiring", "apply", "job", "full-time", "part-time", "role", "position", "solicitar", "empleo", "jornada"];
  const evidenceType = jobSignals.some(w => lower.includes(w)) ? "Job post" : "LinkedIn page/post";
  const growth = ["we are growing", "growing", "expanding", "new location", "busy season", "high demand", "scaling", "creciendo", "expansión"].some(w => lower.includes(w));
  const repetitive = ["daily", "weekly", "manage", "coordinate", "respond", "update", "track", "process", "data entry", "schedule", "follow up", "gestionar", "coordinar", "actualizar"].some(w => lower.includes(w));
  const revenueImpact = ["lead", "sales", "customer", "appointment", "payment", "invoice", "missed", "response time", "no-show", "cliente", "ventas", "pago"].some(w => lower.includes(w));
  const automationFit = ["email", "spreadsheet", "crm", "calendar", "form", "calls", "messages", "invoice", "report", "dashboard", "excel", "correo"].some(w => lower.includes(w));
  const repScore = repetitive ? 2 : 1;
  const impactScore = revenueImpact ? 2 : 1;
  const fitScore = automationFit ? 2 : 1;
  const smbScore = 1;
  const decisionScore = 0;
  const recencyScore = growth || evidenceType === "Job post" ? 2 : 1;
  const totalScore = repScore + impactScore + fitScore + smbScore + decisionScore + recencyScore;
  const priority = totalScore >= 8 ? "🔥 High" : totalScore >= 6 ? "✅ Medium" : totalScore >= 4 ? "⚠️ Low" : "❌ Ignore";
  const quote = extractBestSentence(text, [...best.words, ...(second?.words || [])]) || text.replace(/\s+/g, " ").slice(0, 260);
  const company = guessCompany(data.title, text);

  return {
    company,
    industry: "",
    location: "",
    evidenceType,
    evidenceUrl: data.url,
    painQuote: quote,
    painCategory: best.name,
    automationIdea: best.idea,
    decisionMaker: "",
    decisionMakerTitle: "",
    status: "Not contacted",
    totalScore,
    priority,
    nextAction: "Find decision maker, then send personalized LinkedIn message",
    matchedKeywords: best.found,
    secondaryCategory: second?.name || "None",
    pageTitle: data.title,
    extractedAt: new Date().toISOString()
  };
}

function guessCompany(title, text) {
  const t = title || "";
  if (t.includes(" | LinkedIn")) return t.split(" | LinkedIn")[0].replace(/hiring.*$/i, "").trim();
  const lines = (text || "").split("\n").map(x => x.trim()).filter(Boolean);
  return lines.slice(0, 8).find(l => l.length > 2 && l.length < 70) || "";
}

function extractBestSentence(text, keywords) {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = clean.match(/[^.!?\n]{35,260}[.!?]?/g) || [];
  let bestSentence = "";
  let bestScore = 0;
  for (const sentence of sentences) {
    const s = sentence.toLowerCase();
    const score = keywords.reduce((sum, word) => sum + (s.includes(word) ? 1 : 0), 0);
    if (score > bestScore) { bestScore = score; bestSentence = sentence.trim(); }
  }
  return bestSentence;
}

function csvEscape(v) { return `"${String(v ?? "").replaceAll('"', '""')}"`; }
function toCsvRow(item) {
  return [item.company, item.industry, item.location, item.evidenceType, item.evidenceUrl, item.painQuote, item.painCategory, item.automationIdea, item.decisionMaker, item.decisionMakerTitle, item.status, item.totalScore, item.priority, item.nextAction].map(csvEscape).join(",");
}
function report(item) {
  return `Company: ${item.company}\nURL: ${item.evidenceUrl}\nEvidence type: ${item.evidenceType}\nPain category: ${item.painCategory}\nScore: ${item.totalScore}/10 ${item.priority}\n\nPain signal:\n“${item.painQuote}”\n\nAutomation idea:\n${item.automationIdea}\n\nNext action:\n${item.nextAction}`;
}
function show(item) {
  document.getElementById("company").value = item.company;
  document.getElementById("summary").innerHTML = `<span class="score">${item.totalScore}/10 ${item.priority}</span><br>Category: ${item.painCategory}<br>Matched: ${item.matchedKeywords.join(", ") || "none"}`;
  document.getElementById("output").value = report(item);
}

async function copy(text) {
  await navigator.clipboard.writeText(text);
}

document.getElementById("analyze").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url || !tab.url.includes("linkedin.com")) {
    alert("Open a LinkedIn page first, then click the extension.");
    return;
  }
  const result = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: extractPage });
  current = analyze(result[0].result);
  show(current);
});

document.getElementById("company").addEventListener("input", e => {
  if (current) current.company = e.target.value;
});

document.getElementById("copyCsv").addEventListener("click", async () => {
  if (!current) return alert("Analyze a page first.");
  current.company = document.getElementById("company").value;
  await copy(toCsvRow(current));
  alert("CSV row copied. Paste it into your spreadsheet/tool.");
});

document.getElementById("copyReport").addEventListener("click", async () => {
  if (!current) return alert("Analyze a page first.");
  current.company = document.getElementById("company").value;
  await copy(report(current));
  alert("Report copied.");
});

document.getElementById("downloadJson").addEventListener("click", () => {
  if (!current) return alert("Analyze a page first.");
  current.company = document.getElementById("company").value;
  const blob = new Blob([JSON.stringify(current, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename: `linkedin-opportunity-${Date.now()}.json`, saveAs: true });
});
