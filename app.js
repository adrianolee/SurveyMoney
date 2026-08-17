const STORAGE_KEY = "surveyMoneyState";
const MIN_WITHDRAWAL = 100;
const CONFIG_PATH = "./monetization-config.json";
const SPIN_GAME_URL = "https://s.norviques.com/tml?pid=22211&appk=74LD42Jk2xXhhSRlKOTc5wsFHgIVLpct&did=";

const defaultRuntimeConfig = {
  monetization: {
    enabled: true,
    interstitialUrl: "https://ap9hqw.minigame.com/main",
    title: "Earn more cash by playing games",
    closeText: "X"
  }
};

let runtimeConfig = mergeRuntimeConfig();

const defaultState = {
  withdrawableBalance: 0,
  bonusBalance: 0,
  minimumWithdrawal: MIN_WITHDRAWAL,
  welcomeBonusClaimed: false,
  quickCompletedCount: 0,
  quickCurrentSetProgress: 0,
  quickTotalReward: 0,
  quickCompletionBonusClaimed: false,
  premiumCompletedCount: 0,
  premiumCurrentSetProgress: 0,
  premiumCompletedSets: 0,
  premiumTotalReward: 0,
  availableSpins: 1,
  dailySpinCount: 0,
  lastSpinDate: "",
  withdrawalSubmitted: false,
  withdrawalRecords: []
};

const app = document.getElementById("app");
const toastNode = document.getElementById("toast");

let transient = {
  welcomeDismissed: false,
  quickIndex: 0,
  quickAnswer: null,
  quickReward: 1,
  premiumIndex: 0,
  premiumAnswer: null,
  premiumMulti: [],
  premiumRank: [],
  premiumText: "",
  premiumReward: 6,
  wheelRotation: 0,
  wheelFromRotation: 0,
  interstitial: null,
  spinResult: null,
  spinning: false,
  withdrawAmount: "100.00",
  withdrawEmail: ""
};

function mergeRuntimeConfig(config = {}) {
  return {
    monetization: {
      ...defaultRuntimeConfig.monetization,
      ...(config.monetization || {})
    }
  };
}

function loadRuntimeConfig(done) {
  if (typeof fetch !== "function") {
    done();
    return;
  }

  fetch(`${CONFIG_PATH}?ts=${Date.now()}`, { cache: "no-store" })
    .then(response => response.ok ? response.json() : null)
    .then(config => {
      if (config) runtimeConfig = mergeRuntimeConfig(config);
      done();
    }, done);
}

function getMonetizationConfig() {
  const config = runtimeConfig.monetization || {};
  return {
    enabled: config.enabled !== false,
    interstitialUrl: config.interstitialUrl || "",
    title: config.title || "Earn more cash by playing games",
    closeText: config.closeText || "X"
  };
}

function buildSpinGameUrl(search = location.search, hash = location.hash) {
  const pageParams = new URLSearchParams(search || "");
  const hashQuery = String(hash || "").split("?")[1] || "";
  const hashParams = new URLSearchParams(hashQuery);
  const gaid = pageParams.get("gaid") || pageParams.get("did") || hashParams.get("gaid") || hashParams.get("did");
  return `${SPIN_GAME_URL}${gaid ? encodeURIComponent(gaid) : ""}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : { ...defaultState };
  } catch (error) {
    return { ...defaultState };
  }
}

function saveState(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

function updateState(mutator) {
  const state = loadState();
  mutator(state);
  saveState(state);
  render();
}

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function percent(value) {
  const fixed = Number(value || 0).toFixed(2);
  return fixed.replace(/\.00$/, "").replace(/(\.\d)0$/, "$1") + "%";
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function routeTo(route) {
  location.hash = route;
}

function currentRoute() {
  return location.hash.replace(/^#/, "") || "/home";
}

function showToast(message) {
  toastNode.textContent = message;
  toastNode.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastNode.classList.remove("show"), 2200);
}

function iconCoin() {
  return `
    <svg class="coin-icon" viewBox="0 0 64 64" aria-hidden="true">
      <defs><linearGradient id="coinGrad" x1="0" x2="1"><stop stop-color="#ffe663"/><stop offset="1" stop-color="#ff9d00"/></linearGradient></defs>
      <circle cx="32" cy="32" r="27" fill="url(#coinGrad)"/>
      <circle cx="32" cy="32" r="20" fill="none" stroke="#fff4a5" stroke-width="4"/>
      <text x="32" y="41" text-anchor="middle" font-size="31" font-weight="900" fill="#fff6b8">$</text>
    </svg>
  `;
}

function iconWallet() {
  return `
    <svg class="wallet-icon" viewBox="0 0 64 64" aria-hidden="true">
      <rect x="9" y="18" width="48" height="34" rx="9" fill="#0aa092"/>
      <path d="M15 18h31c5 0 9 4 9 9v4H36c-5 0-9 4-9 9H9V24c0-3 3-6 6-6z" fill="#17c7bd"/>
      <rect x="35" y="30" width="22" height="15" rx="7" fill="#e8fffa"/>
      <circle cx="43" cy="38" r="3.5" fill="#0aa092"/>
    </svg>
  `;
}

function iconStar() {
  return `
    <svg class="star-icon" viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 6l7.6 16.7 18.2 2-13.5 12.4 3.7 17.9L32 46l-16 9 3.7-17.9L6.2 24.7l18.2-2L32 6z" fill="#fff"/>
    </svg>
  `;
}

function artClipboard() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="28" y="20" width="68" height="82" rx="12" fill="#e6fffb" stroke="#08a89d" stroke-width="5"/>
      <rect x="43" y="11" width="38" height="20" rx="7" fill="#0ec6bb"/>
      <path d="M43 53l9 9 19-22" fill="none" stroke="#00a56d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M43 77l9 9 19-22" fill="none" stroke="#00a56d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="25" cy="87" r="14" fill="#ffc928"/>
      <text x="25" y="94" text-anchor="middle" font-size="24" font-weight="900" fill="#fff7ba">$</text>
    </svg>
  `;
}

function artDiamond() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <path d="M21 40l18-24h42l18 24-39 54z" fill="#4b92ff"/>
      <path d="M39 16l21 78L21 40z" fill="#87c6ff"/>
      <path d="M81 16L60 94l39-54z" fill="#1759e8"/>
      <path d="M21 40h78M39 16l-4 24M81 16l4 24" fill="none" stroke="#dff2ff" stroke-width="3"/>
      <circle cx="25" cy="91" r="13" fill="#ffc928"/>
      <circle cx="41" cy="100" r="9" fill="#ffb10a"/>
    </svg>
  `;
}

function artWheel() {
  return `
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="54" cy="55" r="42" fill="#f8b914"/>
      <circle cx="54" cy="55" r="34" fill="#fff"/>
      <path d="M54 21a34 34 0 0 1 34 34H54z" fill="#7c35f5"/>
      <path d="M88 55a34 34 0 0 1-34 34V55z" fill="#00a2ff"/>
      <path d="M54 89a34 34 0 0 1-34-34h34z" fill="#95d81d"/>
      <path d="M20 55a34 34 0 0 1 34-34v34z" fill="#ff7b00"/>
      <circle cx="54" cy="55" r="10" fill="#ffcd2e"/>
      <path d="M50 9h8l7 19H43z" fill="#ffcf24"/>
      <circle cx="88" cy="91" r="13" fill="#ffc928"/>
      <text x="88" y="98" text-anchor="middle" font-size="24" font-weight="900" fill="#fff7ba">$</text>
    </svg>
  `;
}

function artWalletLarge() {
  return `
    <svg class="wallet-illustration" viewBox="0 0 160 110" aria-hidden="true">
      <rect x="31" y="38" width="102" height="58" rx="12" fill="#236bff"/>
      <path d="M41 31h80c10 0 18 8 18 18v15H95c-12 0-22 10-22 22H31V42c0-6 4-11 10-11z" fill="#53a4ff"/>
      <rect x="92" y="59" width="45" height="27" rx="13" fill="#89c8ff"/>
      <circle cx="108" cy="73" r="7" fill="#fff"/>
      <circle cx="28" cy="82" r="12" fill="#ffc928"/>
      <circle cx="128" cy="29" r="16" fill="#ffbd16"/>
      <text x="128" y="38" text-anchor="middle" font-size="31" font-weight="900" fill="#fff2ad">$</text>
    </svg>
  `;
}

function backTopbar(title, right = "") {
  return `
    <div class="topbar center-title ${right ? "has-right" : ""}">
      <button class="icon-button" data-action="home" aria-label="Back">&larr;</button>
      <h1 class="section-title">${title}</h1>
      <div>${right}</div>
    </div>
  `;
}

function homeHeader(state) {
  return `
    <div class="topbar">
      <button class="icon-button" aria-label="Menu">
        <span class="hamburger"><span></span><span></span><span></span></span>
      </button>
      <div class="brand">
        <span class="brand-mark"></span>
        <span>Survey<span class="accent">Money</span></span>
      </div>
      <button class="balance-pill" data-action="withdraw" aria-label="Balance ${money(state.withdrawableBalance)}">
        ${iconWallet()} <span>${money(state.withdrawableBalance)}</span>
      </button>
    </div>
  `;
}

function cashoutCard(state) {
  const progressValue = clamp((state.withdrawableBalance / MIN_WITHDRAWAL) * 100, 0, 100);
  const remaining = Math.max(MIN_WITHDRAWAL - state.withdrawableBalance, 0);
  return `
    <section class="cashout-card">
      <h2>Cashout Progress</h2>
      <div class="cashout-amount">
        <span class="big">${money(state.withdrawableBalance)}</span>
        <span class="target">/ ${money(MIN_WITHDRAWAL)}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" style="--progress:${progressValue}%">${percent(progressValue)}</div>
      </div>
      <p class="cashout-sub">${remaining > 0 ? `Earn ${money(remaining)} more to unlock withdrawal` : "Ready to withdraw"}</p>
      <button class="primary-button" data-action="withdraw">${iconWallet()} Withdraw</button>
    </section>
  `;
}

function surveyCard({ kind, title, subtitle, earn, detail, badge, completed, total, buttonText, action, art }) {
  const progressValue = clamp((completed / total) * 100, 0, 100);
  const isPremium = kind === "premium";
  const isSpin = kind === "spin";
  const className = isSpin ? "spin-card" : `survey-card ${isPremium ? "premium" : ""}`;
  const color = isPremium ? "var(--purple)" : "var(--green)";
  const buttonClass = isSpin ? "orange" : isPremium ? "purple" : "green";
  return `
    <section class="${className}">
      <div class="card-art">${art}</div>
      <div class="card-copy">
        <h3>${title}</h3>
        ${subtitle ? `<p>${subtitle}</p>` : ""}
        <div class="earn">${earn}</div>
        ${badge ? `<div class="card-badge">${badge}</div>` : ""}
        ${detail ? `<div class="card-progress-text">${detail}</div>` : ""}
      </div>
      <div class="card-action">
        ${!isSpin ? `<div class="ring" style="--ring-color:${color};--ring-progress:${progressValue}%">${completed}/${total}</div>` : ""}
        <button class="mini-button ${buttonClass}" data-action="${action}" ${completed >= total && !isSpin ? "disabled" : ""}>
          <span>${buttonText}</span>${!isSpin && completed < total ? `<span class="button-arrow">&gt;</span>` : ""}
        </button>
      </div>
    </section>
  `;
}

function welcomeModal(state) {
  if (state.welcomeBonusClaimed || transient.welcomeDismissed) return "";
  return `
    <div class="modal-backdrop" data-modal="welcome">
      <div class="modal">
        <button class="close" data-action="dismissWelcome" aria-label="Close">&times;</button>
        <h2>Welcome Bonus</h2>
        <div class="gift-art"><span class="gift-bow"></span><span class="gift-box"></span></div>
        <div class="modal-amount">$18.88</div>
        <button class="orange-button" data-action="claimWelcome">Claim Now</button>
      </div>
    </div>
  `;
}

function monetizationInterstitial() {
  const interstitial = transient.interstitial;
  if (!interstitial) return "";

  return `
    <div class="interstitial-backdrop" role="dialog" aria-modal="true">
      <section class="interstitial-panel">
        <div class="interstitial-header">
          <strong>${escapeHtml(interstitial.title)}</strong>
          <button class="interstitial-close" data-action="closeInterstitial">${escapeHtml(interstitial.closeText)}</button>
        </div>
        <iframe
          class="interstitial-frame"
          src="${escapeHtml(interstitial.url)}"
          title="${escapeHtml(interstitial.title)}"
          loading="eager"
          referrerpolicy="no-referrer-when-downgrade"
          sandbox="allow-forms allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-scripts"
        ></iframe>
      </section>
    </div>
  `;
}

function showMonetizationInterstitial(nextRoute) {
  const config = getMonetizationConfig();
  if (!config.enabled || !config.interstitialUrl) {
    routeTo(nextRoute);
    return false;
  }

  transient.interstitial = {
    nextRoute,
    url: config.interstitialUrl,
    title: config.title,
    closeText: config.closeText
  };
  render();
  return true;
}

function homePage(state) {
  return `
    <main class="app-shell home-flow">
      <div class="page">
        ${homeHeader(state)}
        ${cashoutCard(state)}
        <div class="home-list">
          ${surveyCard({
            kind: "quick",
            title: "Quick Survey",
            subtitle: "",
            earn: "Earn $0.20 per question",
            detail: "",
            completed: state.quickCompletedCount,
            total: 100,
            buttonText: state.quickCompletedCount >= 100 ? "Done" : "Start",
            action: "startQuick",
            art: artClipboard()
          })}
          ${surveyCard({
            kind: "premium",
            title: "Premium Survey",
            subtitle: "",
            earn: "Earn $6.00 per set",
            badge: "10 questions per set",
            detail: "",
            completed: state.premiumCompletedCount,
            total: 100,
            buttonText: state.premiumCompletedCount >= 100 ? "Done" : "Start",
            action: "startPremium",
            art: artDiamond()
          })}
          ${surveyCard({
            kind: "spin",
            title: "Lucky Spin",
            subtitle: "Spin & win bonus rewards",
            earn: "Win Cash on Every Spin",
            detail: "",
            completed: 0,
            total: 1,
            buttonText: "Spin Now",
            action: "spinPage",
            art: artWheel()
          })}
          <a
            class="rewards-banner"
            href="https://s.norviques.com/pub/click?pa=27758&cid=60338&pid=22667&d.dir=1"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download now and start earning"
          >
            <img
              src="./assets/home-rewards-banner.png?v=2.0.7"
              alt="Redeem rewards, earn more points, and download now to start earning"
            />
          </a>
        </div>
      </div>
      ${welcomeModal(state)}
    </main>
  `;
}

const quickQuestions = [
  ["How often do you use your phone each day?", ["Less than 1 hour", "1-3 hours", "3-5 hours", "More than 5 hours"]],
  ["Which feature do you use most on your phone?", ["Messaging", "Video apps", "Shopping", "Games"]],
  ["How often do you shop online?", ["Every day", "Several times a week", "Several times a month", "Rarely"]],
  ["What type of reward do you prefer?", ["Cash", "Coupons", "Gift cards", "Extra chances"]],
  ["How do you usually discover new apps?", ["Friends", "Social media", "App store", "Ads"]],
  ["What time do you usually browse shopping apps?", ["Morning", "Afternoon", "Evening", "Late night"]],
  ["Which payment style do you prefer?", ["Digital wallet", "Card", "Cash on delivery", "Bank transfer"]],
  ["How long should a simple survey take?", ["Under 1 minute", "1-3 minutes", "3-5 minutes", "More than 5 minutes"]],
  ["What makes an offer attractive?", ["Clear reward", "Simple steps", "Trusted brand", "Fast payout"]],
  ["Which content do you watch most often?", ["Short videos", "Livestreams", "Reviews", "Tutorials"]]
];

const premiumQuestions = [
  { type: "single", question: "Which of the following best describes your primary reason for shopping online?", hint: "Please select one answer", options: ["It's more convenient", "Better prices and discounts", "More product variety", "To save time"] },
  { type: "single", question: "How do you usually decide whether a new product is trustworthy?", hint: "Please select one answer", options: ["Reviews", "Brand reputation", "Price", "Friend recommendation"] },
  { type: "single", question: "What matters most when choosing a delivery option?", hint: "Please select one answer", options: ["Speed", "Price", "Tracking", "Flexible delivery time"] },
  { type: "multi", question: "Which of the following do you usually use when shopping online?", hint: "Select all that apply", options: ["Shopee / Lazada", "TikTok Shop", "Amazon", "eBay", "Other (please specify)"] },
  { type: "multi", question: "Which promotion types influence your purchase decisions?", hint: "Select all that apply", options: ["Free shipping", "Cashback", "Flash sale", "Bundle discount", "Loyalty points"] },
  { type: "multi", question: "What information do you check before buying a product?", hint: "Select all that apply", options: ["Ratings", "Photos", "Return policy", "Seller profile", "Delivery estimate"] },
  { type: "rank", question: "Please rank the following factors when choosing a product.", hint: "Use the arrows to reorder", options: ["Price", "Quality", "Brand Reputation", "Customer Service", "Design"] },
  { type: "rank", question: "Please rank what makes a shopping app easy to use.", hint: "Use the arrows to reorder", options: ["Search", "Checkout", "Product Photos", "Recommendations", "Customer Support"] },
  { type: "text", question: "Please write your opinion about the product.", hint: "Write at least 30 characters." },
  { type: "text", question: "What would make you recommend this shopping experience to a friend?", hint: "Write at least 30 characters." }
];

function getQuickQuestion(state) {
  const index = (state.quickCompletedCount + transient.quickIndex) % quickQuestions.length;
  const [question, options] = quickQuestions[index];
  return { question, options };
}

function quickPage(state) {
  const current = transient.quickIndex + 1;
  const question = getQuickQuestion(state);
  const progressValue = (current / 5) * 100;
  return `
    <main class="app-shell survey-flow">
      <div class="page">
        ${backTopbar("Quick Survey")}
        <section class="quick-hero">
          <div class="reward">${iconCoin()} +$0.20</div>
          <h2>Question ${current} / 5</h2>
          <div class="progress-track"><div class="progress-fill" style="--progress:${progressValue}%"></div></div>
          ${artWalletLarge()}
        </section>
        <section class="question-card">
          <h1>${question.question}</h1>
          <p class="hint">Please select one answer</p>
          <div class="options">
            ${question.options.map((option, index) => `
              <button class="option radio ${transient.quickAnswer === index ? "selected" : ""}" data-action="quickAnswer" data-index="${index}">
                <span class="radio-dot"></span>
                <span>${option}</span>
              </button>
            `).join("")}
          </div>
          <button class="teal-button survey-next" data-action="quickNext" ${transient.quickAnswer === null ? "disabled" : ""}>Continue</button>
        </section>
      </div>
    </main>
  `;
}

function questionMeta(title, current, total, right) {
  const progressValue = (current / total) * 100;
  return `
    ${backTopbar(title, right)}
    <div class="question-meta">
      <div class="row">
        <span>Question <strong>${current}</strong> / ${total}</span>
        <strong>${percent(progressValue)}</strong>
      </div>
      <div class="thin-progress"><span style="--progress:${progressValue}%"></span></div>
    </div>
  `;
}

function getPremiumQuestion(state) {
  return premiumQuestions[(state.premiumCompletedCount + transient.premiumIndex) % premiumQuestions.length];
}

function premiumPage(state) {
  const current = transient.premiumIndex + 1;
  const question = getPremiumQuestion(state);
  const right = `<span class="reward-pill premium">${iconStar()} +$6.00 per set</span>`;
  return `
    <main class="app-shell survey-flow">
      <div class="page">
        ${questionMeta("Premium Survey", current, 10, right)}
        <section class="question-card">
          <h1>${question.question}</h1>
          <p class="hint">${question.hint}</p>
          ${premiumQuestionBody(question)}
          <button class="purple-button survey-next" data-action="premiumNext" ${isPremiumValid(question) ? "" : "disabled"}>Next Question</button>
        </section>
      </div>
    </main>
  `;
}

function premiumQuestionBody(question) {
  if (question.type === "single") {
    return `
      <div class="options">
        ${question.options.map((option, index) => `
          <button class="option radio ${transient.premiumAnswer === index ? "selected" : ""}" data-action="premiumSingle" data-index="${index}">
            <span class="radio-dot"></span>
            <span>${option}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  if (question.type === "multi") {
    return `
      <div class="options">
        ${question.options.map((option, index) => `
          <button class="option check ${transient.premiumMulti.includes(index) ? "selected" : ""}" data-action="premiumMulti" data-index="${index}">
            <span class="check-box"></span>
            <span>${option}</span>
          </button>
        `).join("")}
      </div>
    `;
  }

  if (question.type === "rank") {
    if (transient.premiumRank.length === 0) transient.premiumRank = [...question.options];
    return `
      <div class="rank-list">
        ${transient.premiumRank.map((item, index) => `
          <div class="rank-row">
            <span class="grip"></span>
            <span class="rank-index">${index + 1}</span>
            <strong>${item}</strong>
            <span class="rank-actions">
              <button data-action="rankUp" data-index="${index}" aria-label="Move up">^</button>
              <button data-action="rankDown" data-index="${index}" aria-label="Move down">v</button>
            </span>
          </div>
        `).join("")}
      </div>
    `;
  }

  return `
    <textarea class="text-answer" data-action="premiumText" placeholder="Type your answer here...">${escapeHtml(transient.premiumText)}</textarea>
    <div class="char-count">${transient.premiumText.length} / 30</div>
  `;
}

function isPremiumValid(question) {
  if (question.type === "single") return transient.premiumAnswer !== null;
  if (question.type === "multi") return transient.premiumMulti.length > 0;
  if (question.type === "text") return transient.premiumText.trim().length >= 30;
  return true;
}

function resetPremiumAnswer(nextQuestion) {
  transient.premiumAnswer = null;
  transient.premiumMulti = [];
  transient.premiumText = "";
  transient.premiumRank = nextQuestion && nextQuestion.type === "rank" ? [...nextQuestion.options] : [];
}

function completionPage({ type, amount, message }) {
  const isPremium = type === "premium";
  return `
    <main class="app-shell">
      <div class="page">
        <section class="completion-card ${isPremium ? "premium" : ""}">
          <h1>${isPremium ? "Premium Survey Completed!" : "Quick Survey Completed!"}</h1>
          <div class="check-circle"></div>
          <div class="completion-amount">+${money(amount)}</div>
          ${message ? `<p>${message}</p>` : ""}
          <button class="${isPremium ? "purple-button" : "teal-button"}" data-action="home">Continue</button>
        </section>
      </div>
    </main>
  `;
}

const spinRewards = [
  { label: "$0.01", type: "bonus_cash", amount: 0.01, weight: 35 },
  { label: "$0.02", type: "bonus_cash", amount: 0.02, weight: 25 },
  { label: "$0.03", type: "bonus_cash", amount: 0.03, weight: 15 },
  { label: "$0.05", type: "bonus_cash", amount: 0.05, weight: 10 },
  { label: "$0.10", type: "bonus_cash", amount: 0.1, weight: 3 },
  { label: "Bonus", type: "bonus", amount: 0, weight: 5 },
  { label: "Extra", type: "extra_spin", amount: 1, weight: 5 },
  { label: "Try", type: "try_again", amount: 0, weight: 2 }
];
const WHEEL_SEGMENT_DEGREES = 360 / spinRewards.length;
const SPIN_FULL_TURNS = 4;

function luckySpinPage(state) {
  return `
    <main class="app-shell">
      <div class="page">
        ${backTopbar("Lucky Spin")}
        <section class="spin-stage ${transient.spinning ? "is-spinning" : ""}">
          <div class="available-box">
            <span>${iconStar()} Available Spins</span>
            <span class="count">${state.availableSpins}</span>
          </div>
          <div class="wheel-wrap">
            <div class="wheel-pointer"></div>
            <div class="wheel ${transient.spinning ? "is-spinning" : ""}" style="transform: rotate(${transient.spinning ? transient.wheelFromRotation : transient.wheelRotation}deg)" data-target-rotation="${transient.wheelRotation}">
              <div class="wheel-labels">
                ${spinRewards.map((reward, index) => `
                  <span style="--angle:${index * WHEEL_SEGMENT_DEGREES + WHEEL_SEGMENT_DEGREES / 2}deg">${reward.label}</span>
                `).join("")}
              </div>
            </div>
          </div>
          <button class="orange-button spin-button ${transient.spinning ? "loading" : ""}" data-action="spin" ${transient.spinning ? "disabled" : ""}>${transient.spinning ? "Spinning..." : "Spin Now"}</button>
          <p class="spin-note"><span class="info-dot">i</span> Bonus rewards are not counted toward cashout progress.</p>
        </section>
      </div>
      ${spinResultModal()}
    </main>
  `;
}

function spinResultModal() {
  const result = transient.spinResult;
  if (!result) return "";
  const isExtra = result.type === "extra_spin";
  const isTryAgain = result.type === "try_again";
  const title = isExtra ? "Extra Spin!" : isTryAgain ? "Try Again!" : "You Won!";
  const amount = isExtra ? "+1" : result.type === "bonus_cash" ? `${money(result.amount)} <span class="orange">Bonus</span>` : isTryAgain ? "Try Again" : "Bonus";
  const copy = isExtra ? "You got an extra spin!" : isTryAgain ? "No reward this time." : "";
  return `
    <div class="modal-backdrop">
      <div class="modal result-modal">
        <h2>${title}</h2>
        <div class="result-coin ${isExtra ? "extra" : ""}">${isExtra ? "+1" : isTryAgain ? "!" : "$"}</div>
        <div class="result-amount">${amount}</div>
        ${copy ? `<p>${copy}</p>` : ""}
        <button class="${isExtra ? "teal-button" : "orange-button"}" data-action="closeSpinResult">OK</button>
      </div>
    </div>
  `;
}

function withdrawPage(state) {
  return `
    <main class="app-shell">
      <div class="page">
        ${backTopbar("Withdraw")}
        <section class="withdraw-hero">
          <h2>Available Balance</h2>
          <p class="balance">${money(state.withdrawableBalance)}</p>
          <p class="min">Minimum Withdrawal<br>${money(MIN_WITHDRAWAL)}</p>
        </section>
        <section class="form-card">
          <div class="field-group">
            <label for="amount">Enter Amount</label>
            <input id="amount" class="text-field" inputmode="decimal" value="${escapeHtml(transient.withdrawAmount)}" data-action="amountInput" />
          </div>
          <div class="field-group">
            <label>Payment Method</label>
            <div class="payment-option"><span>PayPal</span><span class="selected-mark"></span></div>
          </div>
          <div class="field-group">
            <label for="paypal">PayPal Email</label>
            <input id="paypal" class="text-field" type="email" placeholder="youremail@example.com" value="${escapeHtml(transient.withdrawEmail)}" data-action="emailInput" />
          </div>
          <button class="orange-button" data-action="submitWithdraw">Submit Withdrawal</button>
        </section>
        <section class="rules-card">
          <div class="card-art">${artClipboard()}</div>
          <div>
            <h3>Withdrawal Rules</h3>
            <ul>
              <li>Minimum: $100.00</li>
              <li>Complete all questions</li>
              <li>PayPal only</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  `;
}

function withdrawalSubmittedPage() {
  return `
    <main class="app-shell">
      <div class="page">
        <div class="brand" style="margin: 22px 0 72px;">
          <span class="brand-mark"></span>
          <span>Survey<span class="accent">Money</span></span>
        </div>
        <section class="completion-card">
          <h1>Withdrawal Submitted!</h1>
          <div class="check-circle"></div>
          <p>Your withdrawal request has been submitted.</p>
          <button class="teal-button" data-action="home">OK</button>
        </section>
      </div>
    </main>
  `;
}

function render() {
  const state = loadState();
  const route = currentRoute();
  if (route === "/quick" && state.quickCompletedCount >= 100) routeTo("/home");
  if (route === "/premium" && state.premiumCompletedCount >= 100) routeTo("/home");

  if (route === "/quick") {
    app.innerHTML = quickPage(state);
  } else if (route === "/quick-complete") {
    app.innerHTML = completionPage({ type: "quick", amount: transient.quickReward });
  } else if (route === "/premium") {
    app.innerHTML = premiumPage(state);
  } else if (route === "/premium-complete") {
    app.innerHTML = completionPage({ type: "premium", amount: transient.premiumReward, message: "Thank you! Your reward has been added to your balance." });
  } else if (route === "/spin") {
    app.innerHTML = luckySpinPage(state);
  } else if (route === "/withdraw") {
    app.innerHTML = withdrawPage(state);
  } else if (route === "/withdraw-submitted") {
    app.innerHTML = withdrawalSubmittedPage();
  } else {
    app.innerHTML = homePage(state);
  }
  app.innerHTML += monetizationInterstitial();
}

function chooseWeightedReward() {
  const total = spinRewards.reduce((sum, reward) => sum + reward.weight, 0);
  let cursor = Math.random() * total;
  for (const reward of spinRewards) {
    cursor -= reward.weight;
    if (cursor <= 0) return reward;
  }
  return spinRewards[0];
}

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function getSpinRewardIndex(reward) {
  return spinRewards.findIndex(item => item.type === reward.type && item.amount === reward.amount);
}

function calculateSpinTargetRotation(reward, fromRotation = transient.wheelRotation) {
  const rewardIndex = Math.max(getSpinRewardIndex(reward), 0);
  const segmentCenter = rewardIndex * WHEEL_SEGMENT_DEGREES + WHEEL_SEGMENT_DEGREES / 2;
  const targetRotation = normalizeDegrees(-segmentCenter);
  const delta = normalizeDegrees(targetRotation - normalizeDegrees(fromRotation));
  return fromRotation + SPIN_FULL_TURNS * 360 + delta;
}

function submitWithdrawal(state) {
  const amount = Number(transient.withdrawAmount);
  const email = transient.withdrawEmail.trim();
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!Number.isFinite(amount) || amount < MIN_WITHDRAWAL) return "Minimum withdrawal amount is $100.00.";
  if (state.quickCompletedCount < 100 || state.premiumCompletedCount < 100) return "Complete all questions to unlock withdrawal.";
  if (state.withdrawableBalance < MIN_WITHDRAWAL || amount > state.withdrawableBalance) return "Minimum withdrawal amount is $100.00.";
  if (!email) return "Enter your PayPal email.";
  if (!emailOk) return "Enter a valid PayPal email.";

  state.withdrawableBalance = roundMoney(state.withdrawableBalance - amount);
  state.withdrawalSubmitted = true;
  state.withdrawalRecords.push({
    amount,
    method: "PayPal",
    email,
    status: "Submitted",
    createdAt: new Date().toISOString()
  });
  return "";
}

function roundMoney(value) {
  return Math.round(value * 100) / 100;
}

function claimWelcomeBonusState(state) {
  if (state.welcomeBonusClaimed) return 0;
  state.withdrawableBalance = roundMoney(state.withdrawableBalance + 18.88);
  state.welcomeBonusClaimed = true;
  return 18.88;
}

function completeQuickSetState(state) {
  if (state.quickCompletedCount >= 100) return 0;
  const remaining = Math.min(5, 100 - state.quickCompletedCount);
  let reward = roundMoney(remaining * 0.2);
  state.quickCompletedCount += remaining;
  state.quickCurrentSetProgress = 0;
  if (state.quickCompletedCount >= 100 && !state.quickCompletionBonusClaimed) {
    reward = roundMoney(reward + 1.12);
    state.quickCompletionBonusClaimed = true;
  }
  state.withdrawableBalance = roundMoney(state.withdrawableBalance + reward);
  state.quickTotalReward = roundMoney(state.quickTotalReward + reward);
  state.availableSpins += 1;
  return reward;
}

function completePremiumSetState(state) {
  if (state.premiumCompletedCount >= 100) return 0;
  state.premiumCompletedCount = Math.min(100, state.premiumCompletedCount + 10);
  state.premiumCurrentSetProgress = 0;
  state.premiumCompletedSets = Math.min(10, state.premiumCompletedSets + 1);
  state.withdrawableBalance = roundMoney(state.withdrawableBalance + 6);
  state.premiumTotalReward = roundMoney(state.premiumTotalReward + 6);
  state.availableSpins += 3;
  return 6;
}

function applySpinRewardState(state, result) {
  if (result.type === "bonus_cash") state.bonusBalance = roundMoney(state.bonusBalance + result.amount);
  if (result.type === "extra_spin") state.availableSpins += 1;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function handleClick(event) {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  const index = target.dataset.index === undefined ? null : Number(target.dataset.index);

  if (action === "home") {
    routeTo("/home");
    return;
  }

  if (action === "withdraw") {
    routeTo("/withdraw");
    return;
  }

  if (action === "startQuick") {
    transient.quickIndex = 0;
    transient.quickAnswer = null;
    routeTo("/quick");
    return;
  }

  if (action === "startPremium") {
    transient.premiumIndex = 0;
    resetPremiumAnswer(premiumQuestions[0]);
    routeTo("/premium");
    return;
  }

  if (action === "spinPage") {
    location.href = buildSpinGameUrl();
    return;
  }

  if (action === "claimWelcome") {
    updateState(state => {
      claimWelcomeBonusState(state);
    });
    return;
  }

  if (action === "dismissWelcome") {
    transient.welcomeDismissed = true;
    render();
    return;
  }

  if (action === "quickAnswer") {
    transient.quickAnswer = index;
    render();
    return;
  }

  if (action === "quickNext") {
    if (transient.quickAnswer === null) return;
    if (transient.quickIndex < 4) {
      transient.quickIndex += 1;
      transient.quickAnswer = null;
      render();
      return;
    }
    updateState(state => {
      const reward = completeQuickSetState(state);
      transient.quickReward = reward;
      transient.quickIndex = 0;
      transient.quickAnswer = null;
    });
    showMonetizationInterstitial("/quick-complete");
    return;
  }

  if (action === "premiumSingle") {
    transient.premiumAnswer = index;
    render();
    return;
  }

  if (action === "premiumMulti") {
    if (transient.premiumMulti.includes(index)) {
      transient.premiumMulti = transient.premiumMulti.filter(item => item !== index);
    } else {
      transient.premiumMulti = [...transient.premiumMulti, index];
    }
    render();
    return;
  }

  if (action === "rankUp" || action === "rankDown") {
    const next = [...transient.premiumRank];
    const swapWith = action === "rankUp" ? index - 1 : index + 1;
    if (swapWith >= 0 && swapWith < next.length) {
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      transient.premiumRank = next;
      render();
    }
    return;
  }

  if (action === "premiumNext") {
    const state = loadState();
    const question = getPremiumQuestion(state);
    if (!isPremiumValid(question)) return;
    if (transient.premiumIndex < 9) {
      transient.premiumIndex += 1;
      const nextQuestion = premiumQuestions[(state.premiumCompletedCount + transient.premiumIndex) % premiumQuestions.length];
      resetPremiumAnswer(nextQuestion);
      render();
      return;
    }
    updateState(nextState => {
      const reward = completePremiumSetState(nextState);
      transient.premiumReward = reward;
      transient.premiumIndex = 0;
      resetPremiumAnswer(premiumQuestions[0]);
    });
    showMonetizationInterstitial("/premium-complete");
    return;
  }

  if (action === "spin") {
    const state = loadState();
    if (state.availableSpins <= 0) {
      showToast("No spins available.");
      return;
    }
    transient.spinning = true;
    const result = chooseWeightedReward();
    transient.wheelFromRotation = transient.wheelRotation;
    transient.wheelRotation = calculateSpinTargetRotation(result, transient.wheelFromRotation);
    updateState(next => {
      next.availableSpins -= 1;
    });
    setTimeout(() => {
      const wheel = document.querySelector(".wheel.is-spinning");
      if (wheel) wheel.style.transform = `rotate(${wheel.dataset.targetRotation}deg)`;
    }, 30);
    setTimeout(() => {
      updateState(next => {
        applySpinRewardState(next, result);
        transient.spinResult = result;
        transient.spinning = false;
      });
    }, 2550);
    return;
  }

  if (action === "closeSpinResult") {
    transient.spinResult = null;
    render();
    return;
  }

  if (action === "closeInterstitial") {
    const nextRoute = transient.interstitial ? transient.interstitial.nextRoute : "/home";
    transient.interstitial = null;
    routeTo(nextRoute);
    render();
    return;
  }

  if (action === "submitWithdraw") {
    const state = loadState();
    const error = submitWithdrawal(state);
    if (error) {
      showToast(error);
      return;
    }
    saveState(state);
    routeTo("/withdraw-submitted");
  }
}

function handleInput(event) {
  const target = event.target;
  const action = target.dataset.action;
  if (action === "premiumText") {
    transient.premiumText = target.value;
    render();
  }
  if (action === "amountInput") {
    transient.withdrawAmount = target.value;
  }
  if (action === "emailInput") {
    transient.withdrawEmail = target.value;
  }
}

document.addEventListener("click", handleClick);
document.addEventListener("input", handleInput);
window.addEventListener("hashchange", render);

function startApp() {
  if (!location.hash) location.hash = "/home";
  render();
}

loadRuntimeConfig(startApp);
