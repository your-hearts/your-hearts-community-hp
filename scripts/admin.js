import { clone, exportData, fileToDataUrl, importFile, loadData, resetData, saveData } from "./store.js";

let data = loadData();
let selectedJobId = data.jobs[0]?.id ?? "";
const ADMIN_EMAIL = null;
const ADMIN_PASSWORD = null;

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  bindElements();
  renderAll();
  bindActions();
});

function bindElements() {
  [
    "brandName", "brandLabel", "brandTagline", "brandLogo", "lineUrl", "openChatUrl", "xUrl",
    "heroEyebrow", "heroTitle", "heroLead", "heroPrimary", "heroSecondary", "heroMedia",
    "seoIndex", "seoJobs", "seoContact", "seoCompany",
    "heroPreview", "jobList", "jobId", "jobAudience", "jobCategory", "jobStatus",
    "jobPickup", "jobTitle", "jobSummary", "jobReward", "jobDetails", "jsonEditor", "status"
  ].forEach((id) => {
    els[id] = document.querySelector(`#${id}`);
  });
}

function bindActions() {
  document.querySelector("#loginForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const email = document.querySelector("#loginEmail").value.trim();
    const password = document.querySelector("#loginPassword").value;
    const emailOk = ADMIN_EMAIL === null || email === ADMIN_EMAIL;
    const passwordOk = ADMIN_PASSWORD === null || password === ADMIN_PASSWORD;
    if (emailOk && passwordOk) {
      sessionStorage.setItem("your-hearts-admin-auth", "true");
      document.querySelector("#loginScreen").classList.add("is-hidden");
    } else {
      document.querySelector("#loginStatus").textContent = "IDまたはパスワードが違います。";
    }
  });

  if (sessionStorage.getItem("your-hearts-admin-auth") === "true") {
    document.querySelector("#loginScreen").classList.add("is-hidden");
  }

  document.querySelector("#saveMain").addEventListener("click", () => {
    updateMainFromForm();
    persist("保存しました。表示サイトを再読み込みすると反映されます。");
  });

  document.querySelector("#saveSeo").addEventListener("click", () => {
    updateSeoFromForm();
    persist("SEO設定を保存しました。表示サイトを再読み込みするとmeta descriptionに反映されます。");
  });

  document.querySelector("#saveJob").addEventListener("click", () => {
    updateJobFromForm();
    persist("案件を保存しました。");
  });

  document.querySelector("#newJob").addEventListener("click", () => {
    const job = {
      id: `job-${Date.now()}`,
      audience: "individual",
      category: "新規カテゴリ",
      title: "新しい案件",
      summary: "案件概要を入力してください。",
      details: { 報酬: "未設定", 勤務地: "未設定" },
      reward: "",
      status: "下書き",
      pickup: false
    };
    data.jobs.unshift(job);
    selectedJobId = job.id;
    renderJobs();
    renderJobEditor();
    syncJson();
  });

  document.querySelector("#duplicateJob").addEventListener("click", () => {
    const current = currentJob();
    if (!current) return;
    const copy = clone(current);
    copy.id = `${current.id}-copy-${Date.now()}`;
    copy.title = `${current.title} のコピー`;
    data.jobs.unshift(copy);
    selectedJobId = copy.id;
    renderJobs();
    renderJobEditor();
    syncJson();
  });

  document.querySelector("#deleteJob").addEventListener("click", () => {
    if (!selectedJobId) return;
    data.jobs = data.jobs.filter((job) => job.id !== selectedJobId);
    selectedJobId = data.jobs[0]?.id ?? "";
    renderJobs();
    renderJobEditor();
    syncJson();
  });

  document.querySelector("#saveJson").addEventListener("click", () => {
    try {
      data = JSON.parse(els.jsonEditor.value);
      selectedJobId = data.jobs[0]?.id ?? "";
      persist("JSONを保存しました。");
      renderAll();
    } catch (error) {
      setStatus(`JSONの形式を確認してください: ${error.message}`, true);
    }
  });

  document.querySelector("#exportJson").addEventListener("click", () => {
    updateMainFromForm();
    updateJobFromForm();
    exportData(data);
  });

  document.querySelector("#importJson").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      data = await importFile(file);
      selectedJobId = data.jobs[0]?.id ?? "";
      persist("JSONを読み込みました。");
      renderAll();
    } catch (error) {
      setStatus(`読み込みに失敗しました: ${error.message}`, true);
    } finally {
      event.target.value = "";
    }
  });

  document.querySelector("#resetContent").addEventListener("click", () => {
    resetData();
    data = loadData();
    selectedJobId = data.jobs[0]?.id ?? "";
    renderAll();
    setStatus("初期データに戻しました。");
  });

  document.querySelector("#heroMediaUpload").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    data.hero.mediaUrl = await fileToDataUrl(file);
    renderMain();
    syncJson();
    setStatus("ヒーロー画像を読み込みました。保存すると反映されます。");
  });

  document.querySelector("#logoUpload").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    data.brand.logo = await fileToDataUrl(file);
    renderMain();
    syncJson();
    setStatus("ロゴ画像を読み込みました。保存すると反映されます。");
  });
}

function renderAll() {
  renderMain();
  renderJobs();
  renderJobEditor();
  syncJson();
}

function renderMain() {
  els.brandName.value = data.brand.name;
  els.brandLabel.value = data.brand.label;
  els.brandTagline.value = data.brand.tagline;
  els.brandLogo.value = data.brand.logo;
  els.lineUrl.value = data.brand.lineUrl;
  els.openChatUrl.value = data.brand.openChatUrl;
  els.xUrl.value = data.brand.xUrl || "";
  els.heroEyebrow.value = data.hero.eyebrow;
  els.heroTitle.value = data.hero.title;
  els.heroLead.value = data.hero.lead;
  els.heroPrimary.value = data.hero.primaryCta;
  els.heroSecondary.value = data.hero.secondaryCta;
  els.heroMedia.value = data.hero.mediaUrl;
  els.seoIndex.value = data.seo?.index?.description || "";
  els.seoJobs.value = data.seo?.jobs?.description || "";
  els.seoContact.value = data.seo?.contact?.description || "";
  els.seoCompany.value = data.seo?.company?.description || "";
  els.heroPreview.style.backgroundImage = data.hero.mediaUrl ? `url("${data.hero.mediaUrl}")` : "";
}

function renderJobs() {
  els.jobList.innerHTML = data.jobs.map((job) => `
    <button type="button" class="${job.id === selectedJobId ? "active" : ""}" data-job-id="${escapeHtml(job.id)}">
      <strong>${escapeHtml(job.title)}</strong>
      <small>${escapeHtml(job.category)} / ${escapeHtml(job.status)}</small>
    </button>
  `).join("");

  els.jobList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      selectedJobId = button.dataset.jobId;
      renderJobs();
      renderJobEditor();
    });
  });
}

function renderJobEditor() {
  const job = currentJob();
  const disabled = !job;
  document.querySelectorAll("[data-job-field]").forEach((field) => {
    field.disabled = disabled;
  });
  if (!job) return;

  els.jobId.value = job.id;
  els.jobAudience.value = job.audience;
  els.jobCategory.value = job.category;
  els.jobStatus.value = job.status;
  els.jobPickup.value = String(Boolean(job.pickup));
  els.jobTitle.value = job.title;
  els.jobSummary.value = job.summary;
  els.jobReward.value = job.reward || "";
  els.jobDetails.value = JSON.stringify(job.details || {}, null, 2);
}

function updateMainFromForm() {
  data.brand.name = els.brandName.value.trim();
  data.brand.label = els.brandLabel.value.trim();
  data.brand.tagline = els.brandTagline.value.trim();
  data.brand.logo = els.brandLogo.value.trim() || "assets/your-hearts-logo.webp";
  data.brand.lineUrl = els.lineUrl.value.trim();
  data.brand.openChatUrl = els.openChatUrl.value.trim();
  data.brand.xUrl = els.xUrl.value.trim();
  data.hero.eyebrow = els.heroEyebrow.value.trim();
  data.hero.title = els.heroTitle.value.trim();
  data.hero.lead = els.heroLead.value.trim();
  data.hero.primaryCta = els.heroPrimary.value.trim();
  data.hero.secondaryCta = els.heroSecondary.value.trim();
  data.hero.mediaUrl = els.heroMedia.value.trim();
  syncJson();
}

function updateSeoFromForm() {
  data.seo = data.seo || {};
  data.seo.index = data.seo.index || {};
  data.seo.jobs = data.seo.jobs || {};
  data.seo.contact = data.seo.contact || {};
  data.seo.company = data.seo.company || {};
  data.seo.index.description = els.seoIndex.value.trim();
  data.seo.jobs.description = els.seoJobs.value.trim();
  data.seo.contact.description = els.seoContact.value.trim();
  data.seo.company.description = els.seoCompany.value.trim();
  syncJson();
}

function updateJobFromForm() {
  const job = currentJob();
  if (!job) return;

  let details;
  try {
    details = JSON.parse(els.jobDetails.value || "{}");
  } catch (error) {
    setStatus(`案件詳細JSONの形式を確認してください: ${error.message}`, true);
    throw error;
  }

  const nextId = slugify(els.jobId.value) || job.id;
  job.id = nextId;
  selectedJobId = nextId;
  job.audience = els.jobAudience.value;
  job.category = els.jobCategory.value.trim();
  job.status = els.jobStatus.value.trim();
  job.pickup = els.jobPickup.value === "true";
  job.title = els.jobTitle.value.trim();
  job.summary = els.jobSummary.value.trim();
  job.reward = els.jobReward.value.trim();
  job.details = details;
  renderJobs();
  syncJson();
}

function persist(message) {
  saveData(data);
  syncJson();
  setStatus(message);
}

function syncJson() {
  els.jsonEditor.value = JSON.stringify(data, null, 2);
}

function currentJob() {
  return data.jobs.find((job) => job.id === selectedJobId);
}

function setStatus(message, isError = false) {
  els.status.textContent = message;
  els.status.style.color = isError ? "#e4622d" : "#4f9a33";
}

function slugify(value) {
  return String(value)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-ぁ-んァ-ン一-龥]/g, "")
    .toLowerCase();
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}
