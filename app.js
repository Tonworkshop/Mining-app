const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#0f0b08");
  tg.setBackgroundColor("#0f0b08");
}

const workerDefinitions = [
  { level: 1, name: "Classic Duck", emoji: "🐤", cost: 0.17, daily: 0.0015, total: 0.5475, stock: 10, color: ["#3a7afe", "#7d75ff"] },
  { level: 2, name: "Copper Duck", emoji: "🟤", cost: 0.28, daily: 0.006, total: 2.19, stock: 10, color: ["#8b5b29", "#d28d45"] },
  { level: 3, name: "Sailor Duck", emoji: "🦆", cost: 0.5, daily: 0.012, total: 4.38, stock: 10, color: ["#27425a", "#4f7494"] },
  { level: 4, name: "Builder Duck", emoji: "👷", cost: 1.05, daily: 0.03, total: 10.95, stock: 10, color: ["#8f5a16", "#f5a43c"] },
  { level: 5, name: "Miner Duck", emoji: "⛏️", cost: 1.7, daily: 0.052, total: 18.98, stock: 10, color: ["#32655a", "#48b8a0"] },
  { level: 6, name: "Commander Duck", emoji: "🪖", cost: 2.9, daily: 0.09, total: 32.85, stock: 10, color: ["#415227", "#73854f"] },
  { level: 7, name: "Cyber Duck", emoji: "🤖", cost: 4.7, daily: 0.145, total: 52.92, stock: 10, color: ["#284a9a", "#43abff"] },
  { level: 8, name: "Auric Duck", emoji: "💠", cost: 7.5, daily: 0.24, total: 87.6, stock: 10, color: ["#8f3d93", "#db6fff"] },
  { level: 9, name: "Quantum Duck", emoji: "🪐", cost: 11.8, daily: 0.41, total: 149.65, stock: 10, color: ["#4a338a", "#8464ef"] },
  { level: 10, name: "Nova Duck", emoji: "🌟", cost: 19, daily: 0.69, total: 251.85, stock: 10, color: ["#3f61b9", "#67d1f9"] },
  { level: 11, name: "Myth", emoji: "🌐", cost: 70, daily: 7.125, total: 2600.625, stock: 10, color: ["#3b52cc", "#4ca0ff"] },
  { level: 12, name: "Aurora", emoji: "🧊", cost: 95, daily: 10.875, total: 3969.375, stock: 10, color: ["#0f9db3", "#4ef0b3"] },
  { level: 13, name: "Cosmos", emoji: "📡", cost: 141, daily: 18.375, total: 6706.875, stock: 10, color: ["#5f2cab", "#9250ff"] },
  { level: 14, name: "Nebula", emoji: "🧬", cost: 186, daily: 27.75, total: 10128.75, stock: 10, color: ["#b13aa5", "#ff77c8"] },
  { level: 15, name: "Titan", emoji: "♾️", cost: 281, daily: 43.5, total: 15877.5, stock: 10, color: ["#c94a27", "#ff9f1c"] },
];

const tasks = [
  { id: "social-1", title: "Duck's Empire Info kanalına katıl", reward: 0.03, category: "Sosyal", done: false, url: "https://t.me/telegram" },
  { id: "social-2", title: "Duck's Empire Payouts kanalına katıl", reward: 0.03, category: "Sosyal", done: false, url: "https://t.me/telegram" },
  { id: "collab-1", title: "Best Miner Earn TON botuna katıl", reward: 0.03, category: "İş Birliği", done: false, url: "https://t.me/telegram" },
  { id: "collab-2", title: "Hyper Empire Earn TON botuna katıl", reward: 0.03, category: "İş Birliği", done: false, url: "https://t.me/telegram" },
];

const state = {
  activeTab: "empire",
  balance: 0.0015,
  owned: Object.fromEntries(workerDefinitions.map((w) => [w.level, 0])),
  premiumPlan: "free",
  referrals: 1,
  perInviteReward: 0.0015,
  operations: [],
  tasks: tasks.map((task) => ({ ...task })),
};

const premiumPlans = [
  {
    id: "basic",
    name: "Basic Plan",
    badge: "-57%",
    duration: "30 gün",
    price: 4.9,
    boost: 1.1,
    perks: ["Tüm workers kazancına +10% boost", "Günlük +0.004 TON loyalty bonus", "Referral deposit komisyonu +12%", "Öncelikli destek"],
  },
  {
    id: "bronze",
    name: "Bronze Member",
    badge: "-57%",
    duration: "30 gün",
    price: 11.5,
    boost: 1.2,
    perks: ["Tüm workers kazancına +20% boost", "Günlük +0.10 TON loyalty bonus", "Referral deposit komisyonu +12%", "Priority support"],
  },
];

const viewContainer = document.getElementById("viewContainer");
const balanceLabel = document.getElementById("balanceValue");
const toastEl = document.getElementById("toast");

function formatTon(value, maxFraction = 4) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFraction,
  });
}

function getCurrentBoost() {
  const active = premiumPlans.find((plan) => plan.id === state.premiumPlan);
  return active ? active.boost : 1;
}

function getTotalOwned() {
  return Object.values(state.owned).reduce((sum, qty) => sum + qty, 0);
}

function getDailyProfit() {
  const raw = workerDefinitions.reduce((sum, worker) => sum + worker.daily * state.owned[worker.level], 0);
  return raw * getCurrentBoost();
}

function getTotalProfitProjection() {
  const raw = workerDefinitions.reduce((sum, worker) => sum + worker.total * state.owned[worker.level], 0);
  return raw * getCurrentBoost();
}

function isWorkerUnlocked(level) {
  if (level === 1) return true;
  return state.owned[level - 1] > 0;
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toastEl.classList.remove("show"), 1700);
}

function addOperation(type, amount) {
  state.operations.unshift({
    type,
    amount,
    date: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  });
  state.operations = state.operations.slice(0, 6);
}

function hireWorker(level) {
  const worker = workerDefinitions.find((item) => item.level === level);
  if (!worker) return;
  if (!isWorkerUnlocked(level)) {
    showToast(`Önce LV.${level - 1} ördeğini alman gerekiyor.`);
    return;
  }
  if (state.owned[level] >= worker.stock) {
    showToast("Bu seviyede maksimum adede ulaştın.");
    return;
  }
  if (state.balance < worker.cost) {
    showToast(`Yetersiz bakiye. ${formatTon(worker.cost - state.balance)} TON eksik.`);
    return;
  }

  state.balance -= worker.cost;
  state.owned[level] += 1;
  addOperation("İşçi alımı", -worker.cost);
  showToast(`${worker.name} başarıyla alındı.`);
  render();
}

function changeBalance(type, amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("Geçerli bir TON miktarı gir.");
    return;
  }
  if (type === "withdraw" && amount > state.balance) {
    showToast("Çekim için bakiye yetersiz.");
    return;
  }
  if (type === "deposit") {
    state.balance += amount;
    addOperation("Yatırım", amount);
    showToast(`${formatTon(amount)} TON yatırıldı.`);
  } else {
    state.balance -= amount;
    addOperation("Çekim", -amount);
    showToast(`${formatTon(amount)} TON çekildi.`);
  }
  render();
}

function completeTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || task.done) return;
  task.done = true;
  state.balance += task.reward;
  addOperation("Görev ödülü", task.reward);
  window.open(task.url, "_blank", "noopener,noreferrer");
  showToast(`Görev tamamlandı: +${formatTon(task.reward)} TON`);
  render();
}

function subscribe(planId) {
  const plan = premiumPlans.find((item) => item.id === planId);
  if (!plan) return;
  if (state.premiumPlan === plan.id) {
    showToast("Bu plan zaten aktif.");
    return;
  }
  if (state.balance < plan.price) {
    showToast(`Premium için ${formatTon(plan.price)} TON gerekiyor.`);
    return;
  }
  state.balance -= plan.price;
  state.premiumPlan = plan.id;
  addOperation("Premium abonelik", -plan.price);
  showToast(`${plan.name} aktif edildi.`);
  render();
}

function renderEmpireView() {
  const daily = getDailyProfit();
  const totalProfit = getTotalProfitProjection();
  const workersHtml = workerDefinitions
    .map((worker) => {
      const owned = state.owned[worker.level];
      const unlocked = isWorkerUnlocked(worker.level);
      const canBuy = unlocked && state.balance >= worker.cost && owned < worker.stock;
      const levelClass = unlocked ? "" : "locked";
      const [c1, c2] = worker.color;

      return `
      <article class="worker-card ${levelClass}">
        <div class="worker-icon" style="background: linear-gradient(145deg, ${c1}, ${c2})">${worker.emoji}</div>
        <div class="worker-info">
          <h3>${worker.name}<span class="level">LV.${worker.level}</span></h3>
          <div class="worker-stats">
            <div>
              <strong>COST</strong>
              <span>💎 ${formatTon(worker.cost, 3)}</span>
            </div>
            <div>
              <strong>DAILY PROFIT</strong>
              <span class="profit">💎 ${formatTon(worker.daily, 4)}</span>
            </div>
            <div>
              <strong>TOTAL PROFIT</strong>
              <span>💎 ${formatTon(worker.total, 4)}</span>
            </div>
          </div>
        </div>
        <div class="worker-cta">
          <div class="stock">${owned}/${worker.stock}</div>
          ${
            unlocked
              ? `<button class="action-btn ${canBuy ? "primary" : "secondary"}" data-hire="${worker.level}">
                  ${canBuy ? "Hire worker" : `Need ${formatTon(worker.cost, 3)} TON`}
                </button>`
              : `<button class="action-btn secondary" disabled>🔒 LOCKED</button>`
          }
        </div>
      </article>`;
    })
    .join("");

  return `
    <section class="profile-card">
      <div class="avatar"></div>
      <div class="profile-meta">
        <h2>${getDisplayName()}</h2>
        <p class="subtitle">Yeni Üye • Duck Worker Manager</p>
      </div>
      <div class="tag">${state.premiumPlan === "free" ? "Free Plan" : "Premium"}</div>
    </section>

    <section class="stat-grid">
      <article class="stat-card">
        <div class="stat-label">Duck Workers</div>
        <div class="stat-value">${getTotalOwned()}</div>
      </article>
      <article class="stat-card">
        <div class="stat-label">Daily Profit</div>
        <div class="stat-value green">${formatTon(daily, 4)}</div>
      </article>
      <article class="stat-card">
        <div class="stat-label">Total Profit</div>
        <div class="stat-value">${formatTon(totalProfit, 4)}</div>
      </article>
    </section>

    <div class="section-title">Duck Workers • 15 Seviye</div>
    <section class="worker-list">${workersHtml}</section>
  `;
}

function renderWalletView() {
  const operations = state.operations.length
    ? state.operations
        .map(
          (op) => `
      <div class="invite-box">
        <div>
          <strong>${op.type}</strong>
          <div class="tiny">${op.date}</div>
        </div>
        <div class="${op.amount >= 0 ? "profit" : ""}">${op.amount >= 0 ? "+" : ""}${formatTon(op.amount, 4)} TON</div>
      </div>`
        )
        .join("")
    : `<p class="tiny">Henüz işlem yok. İlk yatırımı yaparak başla.</p>`;

  return `
    <section class="wallet-card">
      <h2>Wallet</h2>
      <p class="subtitle">Yatırım yap, işçi satın al ve TON çekimi gerçekleştir.</p>
      <div class="premium-price">
        <span>Mevcut Bakiye</span>
        <b>${formatTon(state.balance, 4)}</b>
      </div>
      <div class="wallet-actions">
        <input id="walletAmount" type="number" step="0.001" min="0" placeholder="TON miktarı (örn: 0.25)" />
        <button class="action-btn primary block" id="depositBtn">Yatırım Yap</button>
        <button class="action-btn secondary block" id="withdrawBtn">Çekim Yap</button>
      </div>
    </section>
    <section class="wallet-card">
      <h3>Son İşlemler</h3>
      ${operations}
    </section>
  `;
}

function renderTasksView() {
  const grouped = ["Sosyal", "İş Birliği"].map((group) => {
    const groupTasks = state.tasks.filter((task) => task.category === group);
    return `
      <div class="section-title">${group}</div>
      ${groupTasks
        .map(
          (task) => `
        <article class="task-card ${task.done ? "locked" : ""}">
          <div class="task-header">
            <strong>${task.title}</strong>
            <span class="task-reward">💎 +${formatTon(task.reward, 3)}</span>
          </div>
          <div class="tiny">${task.done ? "Tamamlandı" : "Görevi tamamla ve ödülü al."}</div>
          <button class="action-btn ${task.done ? "secondary" : "blue"} block" data-task="${task.id}" ${
            task.done ? "disabled" : ""
          }>
            ${task.done ? "Tamamlandı" : "Join"}
          </button>
        </article>`
        )
        .join("")}
    `;
  });

  const remaining = state.tasks.filter((task) => !task.done).reduce((sum, task) => sum + task.reward, 0);

  return `
    <section class="wallet-card">
      <h2>Tasks</h2>
      <p class="subtitle">Misyonları tamamla ve ekstra TON kazan.</p>
      <div class="premium-price">
        <span>Alınabilir ödül</span>
        <b>${formatTon(remaining, 4)}</b>
      </div>
    </section>
    ${grouped.join("")}
  `;
}

function renderFriendsView() {
  const inviteLink = `https://t.me/DucksEmpire_Bot?start=F${Math.floor(1000 + Math.random() * 8999)}`;
  const referralIncome = state.referrals * state.perInviteReward;
  return `
    <section class="referral-card">
      <h2>Referrals</h2>
      <p class="subtitle">Her davetten kazan, ekip kur ve geliri büyüt.</p>
      <div class="referral-grid">
        <article class="ref-mini">
          <div class="tiny">Toplam Referans</div>
          <div class="stat-value">${state.referrals}</div>
        </article>
        <article class="ref-mini">
          <div class="tiny">Invite başı</div>
          <div class="stat-value">💎 ${formatTon(state.perInviteReward, 4)}</div>
        </article>
      </div>
      <div class="invite-box">
        <span class="invite-link">${inviteLink}</span>
        <button class="action-btn secondary" id="copyInvite">Copy</button>
      </div>
      <button class="action-btn primary block" id="shareTelegram">Share to Telegram</button>
    </section>
    <section class="wallet-card">
      <h3>Referral Geliri</h3>
      <p class="subtitle">Toplam anlık referral bonusu: ${formatTon(referralIncome, 4)} TON</p>
      <button class="action-btn secondary block" id="simulateReferral">+1 Referral Simülasyonu</button>
    </section>
  `;
}

function renderPremiumView() {
  const activePlan = premiumPlans.find((plan) => plan.id === state.premiumPlan);
  const currentBoost = getCurrentBoost();
  const cards = premiumPlans
    .map(
      (plan) => `
      <article class="premium-card">
        <div class="task-header">
          <h3>${plan.name}</h3>
          <span class="task-reward">${plan.badge}</span>
        </div>
        <div class="tiny">${plan.duration}</div>
        <div class="premium-price">
          <span>Fiyat</span>
          <b>${formatTon(plan.price, 2)}</b>
        </div>
        <ul class="premium-list">
          ${plan.perks.map((perk) => `<li>${perk}</li>`).join("")}
        </ul>
        <button class="action-btn primary block" data-subscribe="${plan.id}">
          ${state.premiumPlan === plan.id ? "Aktif Plan" : `Subscribe - ${formatTon(plan.price, 2)} TON`}
        </button>
      </article>
    `
    )
    .join("");

  return `
    <section class="wallet-card">
      <h2>Premium Access</h2>
      <p class="subtitle">Kazancını hızlandır, otomatik bonusları aç.</p>
      <div class="premium-price">
        <span>Aktif Durum</span>
        <b>${activePlan ? activePlan.name : "Free"}</b>
      </div>
      <p class="tiny">Mevcut Profit Çarpanı: x${formatTon(currentBoost, 2)}</p>
    </section>
    ${cards}
  `;
}

function getDisplayName() {
  const user = tg?.initDataUnsafe?.user;
  if (!user) return "Duck Worker";
  return [user.first_name, user.last_name].filter(Boolean).join(" ");
}

function bindEmpireActions() {
  viewContainer.querySelectorAll("[data-hire]").forEach((button) => {
    button.addEventListener("click", () => {
      const level = Number(button.getAttribute("data-hire"));
      if (tg) tg.HapticFeedback?.impactOccurred("light");
      hireWorker(level);
    });
  });
}

function bindWalletActions() {
  const amountInput = document.getElementById("walletAmount");
  const depositButton = document.getElementById("depositBtn");
  const withdrawButton = document.getElementById("withdrawBtn");
  if (!amountInput || !depositButton || !withdrawButton) return;

  const getAmount = () => Number(amountInput.value.replace(",", "."));
  depositButton.addEventListener("click", () => changeBalance("deposit", getAmount()));
  withdrawButton.addEventListener("click", () => changeBalance("withdraw", getAmount()));
}

function bindTaskActions() {
  viewContainer.querySelectorAll("[data-task]").forEach((button) => {
    button.addEventListener("click", () => {
      const taskId = button.getAttribute("data-task");
      if (!taskId) return;
      completeTask(taskId);
    });
  });
}

function bindFriendActions() {
  const copyButton = document.getElementById("copyInvite");
  const shareButton = document.getElementById("shareTelegram");
  const simulateButton = document.getElementById("simulateReferral");
  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const link = viewContainer.querySelector(".invite-link")?.textContent || "";
      try {
        await navigator.clipboard.writeText(link);
        showToast("Davet linki kopyalandı.");
      } catch (_err) {
        showToast("Kopyalama desteklenmiyor.");
      }
    });
  }
  if (shareButton) {
    shareButton.addEventListener("click", () => {
      const link = viewContainer.querySelector(".invite-link")?.textContent || "";
      window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}`, "_blank", "noopener,noreferrer");
    });
  }
  if (simulateButton) {
    simulateButton.addEventListener("click", () => {
      state.referrals += 1;
      state.balance += state.perInviteReward;
      addOperation("Referral bonus", state.perInviteReward);
      showToast(`Yeni referral: +${formatTon(state.perInviteReward, 4)} TON`);
      render();
    });
  }
}

function bindPremiumActions() {
  viewContainer.querySelectorAll("[data-subscribe]").forEach((button) => {
    button.addEventListener("click", () => {
      const planId = button.getAttribute("data-subscribe");
      if (!planId) return;
      subscribe(planId);
    });
  });
}

function bindViewActions() {
  switch (state.activeTab) {
    case "empire":
      bindEmpireActions();
      break;
    case "wallet":
      bindWalletActions();
      break;
    case "tasks":
      bindTaskActions();
      break;
    case "friends":
      bindFriendActions();
      break;
    case "premium":
      bindPremiumActions();
      break;
    default:
      break;
  }
}

function renderView() {
  switch (state.activeTab) {
    case "wallet":
      return renderWalletView();
    case "tasks":
      return renderTasksView();
    case "friends":
      return renderFriendsView();
    case "premium":
      return renderPremiumView();
    case "empire":
    default:
      return renderEmpireView();
  }
}

function render() {
  balanceLabel.textContent = formatTon(state.balance, 4);
  viewContainer.innerHTML = renderView();
  bindViewActions();
}

function initNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelector(".nav-item.active")?.classList.remove("active");
      button.classList.add("active");
      state.activeTab = button.getAttribute("data-tab") || "empire";
      render();
    });
  });
}

function initQuickDeposit() {
  const quickDeposit = document.getElementById("quickDeposit");
  if (!quickDeposit) return;
  quickDeposit.addEventListener("click", () => {
    changeBalance("deposit", 0.25);
  });
}

initNavigation();
initQuickDeposit();
render();
