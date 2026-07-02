import { loadData } from "./store.js?v=school-name-update";

const data = loadData();
const state = {
  activeAudience: "all",
  activeCategory: "all"
};

const selectors = {
  jobs: document.querySelector("#jobsGrid"),
  filters: document.querySelector("#jobFilters"),
  mobileMenu: document.querySelector("#mobileMenu"),
  pickup: document.querySelector("#pickupTrack")
};

document.addEventListener("DOMContentLoaded", () => {
  applySeo();
  hydrateText();
  renderStats();
  renderPurposes();
  renderConcerns();
  renderActivities();
  renderSystem();
  renderMission();
  renderOffice();
  renderCompany();
  renderPickupJobs();
  renderJobFilters();
  renderJobs();
  initJobModal();
  initNavigation();
  initForms();
  initReveal();
  initHeroCanvas();
  initKineticPanels();
});

function applySeo() {
  const pageKey = pageKeyFromPath();
  const description = data.seo?.[pageKey]?.description;
  if (!description) return;

  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.name = "description";
    document.head.append(meta);
  }
  meta.content = description;
}

function pageKeyFromPath() {
  const file = window.location.pathname.split("/").pop() || "index.html";
  return file.replace(".html", "") || "index";
}

function hydrateText() {
  setText("[data-brand-name]", data.brand.name);
  setText("[data-brand-label]", data.brand.label);
  setText("[data-brand-tagline]", data.brand.tagline);
  setText("[data-hero-eyebrow]", data.hero.eyebrow);
  setText("[data-hero-title]", data.hero.title);
  setText("[data-hero-lead]", data.hero.lead);
  setText("[data-primary-cta]", data.hero.primaryCta);
  setText("[data-secondary-cta]", data.hero.secondaryCta);
  setText("[data-system-lead]", data.system.lead);
  setText("[data-mission-title]", data.mission.title);

  document.querySelectorAll("[data-logo]").forEach((image) => {
    image.src = data.brand.logo;
    image.alt = `${data.brand.name} ロゴ`;
  });

  document.querySelectorAll("[data-line-link]").forEach((link) => {
    link.href = data.brand.lineUrl;
  });

  document.querySelectorAll("[data-open-chat]").forEach((link) => {
    link.href = data.brand.openChatUrl;
  });

  document.querySelectorAll("[data-x-link]").forEach((link) => {
    link.href = data.brand.xUrl;
  });

  const media = document.querySelector("[data-hero-media]");
  if (media && data.hero.mediaUrl) {
    media.style.backgroundImage = `linear-gradient(120deg, rgba(26,46,64,.08), rgba(255,145,77,.04)), url("${data.hero.mediaUrl}")`;
    media.classList.add("has-image");
  }
}

function renderStats() {
  const root = document.querySelector("#stats");
  if (!root) return;
  root.innerHTML = data.stats.map((item) => `
    <li class="stat reveal">
      <strong>${escapeHtml(item.value)}</strong>
      <span>${escapeHtml(item.label)}</span>
    </li>
  `).join("");
}

function renderPurposes() {
  const root = document.querySelector("#purposes");
  if (!root) return;
  root.innerHTML = data.purposes.map((item, index) => `
    <article class="purpose-card reveal" style="--delay:${index * 70}ms">
      <div class="purpose-mark">${String(index + 1).padStart(2, "0")}</div>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
    </article>
  `).join("");
}

function renderConcerns() {
  const root = document.querySelector("#concerns");
  if (!root) return;
  root.innerHTML = data.concerns.map((text) => `
    <li class="concern-item reveal">
      <span aria-hidden="true">✓</span>
      <p>${escapeHtml(text)}</p>
    </li>
  `).join("");
}

function renderActivities() {
  const root = document.querySelector("#activities");
  if (!root) return;
  root.innerHTML = data.activities.map((item, index) => {
    const href = item.url || (index === 0 ? data.brand.openChatUrl : data.brand.lineUrl);
    return `
      <article class="activity-card reveal">
        <span>${escapeHtml(item.tag)}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.text)}</p>
        <a class="text-link" href="${href}" target="_blank" rel="noopener">${escapeHtml(item.action)}</a>
      </article>
    `;
  }).join("");
}

function renderSystem() {
  const steps = document.querySelector("#steps");
  if (!steps) return;
  steps.innerHTML = data.system.steps.map((step, index) => `
    <article class="step-card reveal">
      <span>${index + 1}</span>
      <h3>${escapeHtml(step.title)}</h3>
      <p>${escapeHtml(step.text)}</p>
    </article>
  `).join("");

  const reward = data.system.rewardExample;
  const rewardRoot = document.querySelector("#rewardExample");
  if (rewardRoot) rewardRoot.innerHTML = `
    <p class="pill">${escapeHtml(reward.title)}</p>
    <p class="muted">${escapeHtml(reward.base)}</p>
    <strong>${escapeHtml(reward.amount)}</strong>
    <p>${escapeHtml(reward.text)}</p>
  `;

  const distribution = document.querySelector("#distribution");
  if (distribution) distribution.innerHTML = data.system.distribution.map((item) => `
    <li>
      <span>${escapeHtml(item.value)}</span>
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <p>${escapeHtml(item.text)}</p>
      </div>
    </li>
  `).join("");

  const conditions = document.querySelector("#conditions");
  if (conditions) conditions.innerHTML = data.system.conditions.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderMission() {
  const root = document.querySelector("#missionParagraphs");
  if (!root) return;
  root.innerHTML = data.mission.paragraphs.map((item) => `<p>${escapeHtml(item)}</p>`).join("");
}

function renderOffice() {
  const root = document.querySelector("#office");
  if (!root) return;
  root.innerHTML = data.office.map((item) => `
    <tr>
      <th>${escapeHtml(item.label)}</th>
      <td>${item.value.startsWith("http") ? `<a href="${escapeHtml(item.value)}" target="_blank" rel="noopener">${escapeHtml(item.value)}</a>` : escapeHtml(item.value)}</td>
    </tr>
  `).join("");
}

function renderCompany() {
  const profile = document.querySelector("#companyProfile");
  const history = document.querySelector("#companyHistory");
  if (!profile && !history) return;

  if (profile) {
    profile.innerHTML = data.company.profile.map((item) => `
      <tr>
        <th>${escapeHtml(item.label)}</th>
        <td>${item.value.startsWith("http") ? `<a href="${escapeHtml(item.value)}" target="_blank" rel="noopener">${escapeHtml(item.value)}</a>` : escapeHtml(item.value)}</td>
      </tr>
    `).join("");
  }

  if (history) {
    history.innerHTML = data.company.history.map((item) => `
      <li>
        <span>${escapeHtml(item.year)}</span>
        <p>${escapeHtml(item.text)}</p>
      </li>
    `).join("");
  }
}

function renderPickupJobs() {
  if (!selectors.pickup) return;
  const pickupJobs = data.jobs.filter((job) => job.pickup).slice(0, 8);
  const items = pickupJobs.length ? pickupJobs : data.jobs.slice(0, 6);
  const markup = items.map((job) => `
    <a class="pickup-card" href="#jobsGrid">
      <span>${escapeHtml(job.category)}</span>
      <strong>${escapeHtml(job.title)}</strong>
      <small>${escapeHtml(job.reward || job.status)}</small>
    </a>
  `).join("");
  selectors.pickup.innerHTML = markup + markup;
}

function renderJobFilters() {
  if (!selectors.filters) return;
  const audienceLabels = {
    individual: "個人向け",
    referral: "紹介案件",
    corporate: "企業向け"
  };
  const audiences = [
    { id: "all", label: "すべて" },
    ...[...new Set(data.jobs.map((job) => job.audience))]
      .map((id) => ({ id, label: audienceLabels[id] || id }))
  ];
  const categoryOrder = ["人材紹介案件", "人材紹介案件（外国人）", "不動産仲介"];
  const categories = [...new Set(data.jobs.map((job) => job.category))]
    .sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b, "ja");
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });

  selectors.filters.innerHTML = `
    <div class="filter-group">
      ${audiences.map((item) => filterButton("audience", item.id, item.label, item.id === state.activeAudience)).join("")}
    </div>
    <div class="filter-group">
      ${filterButton("category", "all", "全カテゴリ", state.activeCategory === "all")}
      ${categories.map((category) => filterButton("category", category, category, category === state.activeCategory)).join("")}
    </div>
  `;

  selectors.filters.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state[button.dataset.type === "audience" ? "activeAudience" : "activeCategory"] = button.dataset.value;
      renderJobFilters();
      renderJobs();
    });
  });
}

function filterButton(type, value, label, active) {
  return `<button class="filter-button ${active ? "active" : ""}" data-type="${type}" data-value="${escapeHtml(value)}">${escapeHtml(label)}</button>`;
}

function renderJobs() {
  if (!selectors.jobs) return;
  const jobs = data.jobs.filter((job) => {
    const audienceMatch = state.activeAudience === "all" || job.audience === state.activeAudience;
    const categoryMatch = state.activeCategory === "all" || job.category === state.activeCategory;
    return audienceMatch && categoryMatch;
  });

  selectors.jobs.innerHTML = jobs.map((job) => {
    const meta = jobMeta(job);
    return `
    <article class="job-card asp-card reveal">
      <div class="job-card__top">
        <span>${escapeHtml(job.category)}</span>
        <small>${escapeHtml(job.status)}</small>
      </div>
      <div class="job-card__body">
        <div class="asp-metrics">
          <div>
            <span>${escapeHtml(meta.rewardLabel)}</span>
            <strong>${escapeHtml(meta.rewardValue)}</strong>
          </div>
          <div>
            <span>${escapeHtml(meta.fitLabel)}</span>
            <strong>${escapeHtml(meta.fitValue)}</strong>
          </div>
        </div>
        <h3>${escapeHtml(job.title)}</h3>
        <p>${escapeHtml(job.summary)}</p>
        <ul class="asp-chips">
          ${meta.chips.map((chip) => `<li>${escapeHtml(chip)}</li>`).join("")}
        </ul>
      </div>
      <div class="job-card__actions">
        <button type="button" class="job-detail-button" data-job-id="${escapeHtml(job.id)}">詳細を見る</button>
        <a href="contact.html?job=${encodeURIComponent(job.title)}" class="job-card__action" data-job-title="${escapeHtml(job.title)}">お問い合わせ</a>
      </div>
    </article>
  `;
  }).join("");

  const count = document.querySelector("#jobCount");
  if (count) count.textContent = `${jobs.length}件`;
  selectors.jobs.querySelectorAll("[data-job-id]").forEach((button) => {
    button.addEventListener("click", () => openJobModal(button.dataset.jobId));
  });
  initReveal();
}

function initJobModal() {
  const modal = document.querySelector("#jobModal");
  if (!modal) return;

  modal.querySelectorAll("[data-close-job-modal]").forEach((button) => {
    button.addEventListener("click", closeJobModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeJobModal();
  });
}

function openJobModal(jobId) {
  const modal = document.querySelector("#jobModal");
  const content = document.querySelector("#jobModalContent");
  const job = data.jobs.find((item) => item.id === jobId);
  if (!modal || !content || !job) return;

  const meta = jobMeta(job);
  content.innerHTML = `
    <div class="job-detail-head">
      <span>${escapeHtml(job.category)}</span>
      <small>${escapeHtml(job.status)}</small>
      <h2 id="jobModalTitle">${escapeHtml(job.title)}</h2>
      <p>${escapeHtml(job.summary)}</p>
    </div>
    <div class="job-detail-metrics">
      <div>
        <span>${escapeHtml(meta.rewardLabel)}</span>
        <strong>${escapeHtml(meta.rewardValue)}</strong>
      </div>
      <div>
        <span>${escapeHtml(meta.fitLabel)}</span>
        <strong>${escapeHtml(meta.fitValue)}</strong>
      </div>
      <div>
        <span>対象</span>
        <strong>${escapeHtml(audienceLabel(job.audience))}</strong>
      </div>
    </div>
    <section class="job-detail-section">
      <h3>案件詳細</h3>
      <dl>
        ${Object.entries(job.details || {}).map(([key, value]) => `
          <div>
            <dt>${escapeHtml(key)}</dt>
            <dd>${escapeHtml(value)}</dd>
          </div>
        `).join("")}
      </dl>
    </section>
    <section class="job-detail-section">
      <h3>向いている方</h3>
      <ul>
        ${recommendations(job).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </section>
    <div class="job-detail-actions">
      <a class="button primary" href="contact.html?job=${encodeURIComponent(job.title)}">この案件についてお問い合わせ</a>
      <button class="ghost-button" type="button" data-close-job-modal>一覧に戻る</button>
    </div>
  `;

  content.querySelector("[data-close-job-modal]").addEventListener("click", closeJobModal);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
}

function closeJobModal() {
  const modal = document.querySelector("#jobModal");
  if (!modal) return;
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

function jobMeta(job) {
  const entries = Object.entries(job.details || {});
  const rewardEntry = entries.find(([key]) => /報酬|給与|月給|年収|紹介料|待遇/.test(key));
  const placeEntry = entries.find(([key]) => /勤務地|対象エリア|形式/.test(key));
  const conditionEntry = entries.find(([key]) => /条件|要件|勤務形態|勤務時間|休日|対象コース/.test(key));
  const rewardValue = job.reward || rewardEntry?.[1] || "個別確認";
  const fitValue = job.audience === "corporate" ? "施設向け" : job.audience === "referral" ? "紹介向け" : "応募向け";

  return {
    rewardLabel: job.reward ? "紹介料目安" : rewardEntry?.[0] || "報酬",
    rewardValue,
    fitLabel: "タイプ",
    fitValue,
    chips: [placeEntry?.[1], conditionEntry?.[1], audienceLabel(job.audience)].filter(Boolean).slice(0, 3)
  };
}

function audienceLabel(audience) {
  return {
    individual: "個人向け",
    referral: "紹介案件",
    corporate: "企業向け"
  }[audience] || "案件";
}

function recommendations(job) {
  if (job.audience === "corporate") {
    return [
      "介護・福祉施設の採用や人員補強を検討している方",
      "正社員・派遣・スポット人材を柔軟に相談したい方",
      "条件に合う人材を効率よく探したい方"
    ];
  }
  if (job.audience === "referral") {
    return [
      "周囲に転職・住み替え・資格取得を検討している方がいる方",
      "相談に乗りながら、紹介報酬の機会も作りたい方",
      "福祉業界の人脈や経験を活かしたい方"
    ];
  }
  return [
    "介護・福祉の経験を活かして収入や働き方を広げたい方",
    "副業・派遣・転職の選択肢を比較したい方",
    "条件だけでなく続けやすさも重視したい方"
  ];
}

function initNavigation() {
  const button = document.querySelector("#menuButton");
  if (!button || !selectors.mobileMenu) return;
  button.addEventListener("click", () => {
    const isOpen = selectors.mobileMenu.classList.toggle("open");
    button.setAttribute("aria-expanded", String(isOpen));
  });

  selectors.mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => selectors.mobileMenu.classList.remove("open"));
  });
}

function initForms() {
  const form = document.querySelector("#contactForm");
  if (!form) return;
  const message = document.querySelector("#message");
  const jobTitle = new URLSearchParams(window.location.search).get("job");
  if (message && jobTitle) {
    message.value = `${jobTitle}について相談したいです。`;
  }
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const status = document.querySelector("#formStatus");
    status.textContent = "送信デモです。実運用ではメール送信またはCRM連携を接続します。";
    event.currentTarget.reset();
  });
}

function initReveal() {
  const targets = document.querySelectorAll(".reveal:not(.is-observed)");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  targets.forEach((target) => {
    target.classList.add("is-observed");
    observer.observe(target);
  });
}

function initHeroCanvas() {
  const canvas = document.querySelector("#heroCanvas");
  if (!canvas) return;
  const context = canvas.getContext("2d");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let width = 0;
  let height = 0;
  let particles = [];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.max(34, Math.floor(width / 18)) }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.42,
      r: 1.5 + Math.random() * 3,
      hue: index % 3
    }));
  }

  function frame(time = 0) {
    context.clearRect(0, 0, width, height);
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(255,145,77,.34)");
    gradient.addColorStop(.48, "rgba(137,197,65,.20)");
    gradient.addColorStop(1, "rgba(26,46,64,.26)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    particles.forEach((point, index) => {
      if (!prefersReducedMotion) {
        point.x += point.vx + Math.sin(time / 1400 + index) * 0.12;
        point.y += point.vy + Math.cos(time / 1700 + index) * 0.12;
      }
      if (point.x < -10) point.x = width + 10;
      if (point.x > width + 10) point.x = -10;
      if (point.y < -10) point.y = height + 10;
      if (point.y > height + 10) point.y = -10;

      context.beginPath();
      context.fillStyle = point.hue === 0 ? "rgba(255,255,255,.78)" : point.hue === 1 ? "rgba(137,197,65,.72)" : "rgba(255,145,77,.72)";
      context.arc(point.x, point.y, point.r, 0, Math.PI * 2);
      context.fill();

      for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex++) {
        const other = particles[otherIndex];
        const dx = other.x - point.x;
        const dy = other.y - point.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 118) {
          context.strokeStyle = `rgba(255,255,255,${(1 - distance / 118) * 0.28})`;
          context.lineWidth = 1;
          context.beginPath();
          context.moveTo(point.x, point.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    });

    if (!prefersReducedMotion) requestAnimationFrame(frame);
  }

  resize();
  frame();
  window.addEventListener("resize", resize);
}

function initKineticPanels() {
  document.querySelectorAll(".kinetic-panel").forEach((panel) => {
    panel.addEventListener("pointermove", (event) => {
      const rect = panel.getBoundingClientRect();
      panel.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width) * 100}%`);
      panel.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height) * 100}%`);
    });
  });
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value;
  });
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
