const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#0b0806");
  tg.setBackgroundColor("#090604");
}

const workers = [
  { level: 1, name: "Classic Duck", icon: "🐤", cost: 0.17, daily: 0.0015, total: 0.5475, stock: 10, colors: ["#3c74fc", "#7775ff"] },
  { level: 2, name: "Copper Duck", icon: "🦆", cost: 0.28, daily: 0.006, total: 2.19, stock: 10, colors: ["#8a5a26", "#d88f43"] },
  { level: 3, name: "Sailor Duck", icon: "⚓", cost: 0.5, daily: 0.012, total: 4.38, stock: 10, colors: ["#2c4966", "#5b82a2"] },
  { level: 4, name: "Builder Duck", icon: "👷", cost: 1.05, daily: 0.03, total: 10.9, stock: 10, colors: ["#946118", "#e8a53b"] },
  { level: 5, name: "Miner Duck", icon: "⛏", cost: 1.7, daily: 0.052, total: 18.98, stock: 10, colors: ["#2f6b58", "#4cb894"] },
  { level: 6, name: "Commander Duck", icon: "🪖", cost: 2.9, daily: 0.09, total: 32.85, stock: 10, colors: ["#4a5b2d", "#738e4a"] },
  { level: 7, name: "Cyber Duck", icon: "🤖", cost: 4.7, daily: 0.145, total: 52.92, stock: 10, colors: ["#2c4899", "#41afff"] },
  { level: 8, name: "Auric Duck", icon: "✦", cost: 7.5, daily: 0.24, total: 87.6, stock: 10, colors: ["#8342a3", "#da7cff"] },
  { level: 9, name: "Quantum Duck", icon: "🪐", cost: 11.8, daily: 0.41, total: 149.65, stock: 10, colors: ["#533195", "#8868ef"] },
  { level: 10, name: "Nova Duck", icon: "✨", cost: 19, daily: 0.69, total: 251.85, stock: 10, colors: ["#3c5db6", "#67d3f8"] },
  { level: 11, name: "Myth", icon: "◉", cost: 70, daily: 7.125, total: 2600.625, stock: 10, colors: ["#3f53cb", "#4ba1ff"] },
  { level: 12, name: "Aurora", icon: "▤", cost: 95, daily: 10.875, total: 3969.375, stock: 10, colors: ["#0e9fb5", "#4ef5b4"] },
  { level: 13, name: "Cosmos", icon: "⌁", cost: 141, daily: 18.375, total: 6706.875, stock: 10, colors: ["#612fab", "#9550ff"] },
  { level: 14, name: "Nebula", icon: "✳", cost: 186, daily: 27.75, total: 10128.75, stock: 10, colors: ["#af3ba7", "#fd77cc"] },
  { level: 15, name: "Titan", icon: "∞", cost: 281, daily: 43.5, total: 15877.5, stock: 10, colors: ["#cc4d29", "#ff9f1d"] },
];

const initialTasks = [
  {
    id: "social-1",
    category: "SOCIAL",
    title: "Join Duck's Empire Info",
    description: "Follow the official Duck's Empire info channel.",
    reward: 0.03,
    link: "https://t.me/telegram",
    icon: "✈",
  },
  {
    id: "social-2",
    category: "SOCIAL",
    title: "Join Duck's Empire Payouts",
    description: "See real withdrawal proofs from duck farmers.",
    reward: 0.03,
    link: "https://t.me/telegram",
    icon: "✈",
  },
  {
    id: "collab-1",
    category: "COLLABORATION",
    title: "Join Best Miner Earn TON",
    description: "Start mining with our partner ecosystem bot.",
    reward: 0.03,
    link: "https://t.me/telegram",
    icon: "⚙",
  },
  {
    id: "collab-2",
    category: "COLLABORATION",
    title: "Join Hyper Empire Earn TON",
    description: "Unlock cross-campaign rewards and boosts.",
    reward: 0.03,
    link: "https://t.me/telegram",
    icon: "⚙",
  },
];

const premiumPlans = [
  {
    id: "basic",
    name: "Basic Plan",
    badge: "-57%",
    period: "30 days",
    price: 4.9,
    oldPrice: 11.5,
    boost: 1.1,
    perks: [
      "10% profit boost on all workers",
      "Daily loyalty bonus: +0.004 TON",
      "+12% deposit commission from referrals",
      "Priority support",
    ],
  },
  {
    id: "pro",
    name: "Bronze Member",
    badge: "-57%",
    period: "30 days",
    price: 11.5,
    oldPrice: 26.7,
    boost: 1.24,
    perks: [
      "24% profit boost on all workers",
      "Daily loyalty bonus: +0.10 TON",
      "Extra milestone rewards",
      "VIP task access",
    ],
  },
];

const state = {
  activeTab: "empire",
  balance: 0.0015,
  referrals: 1,
  perInviteReward: 0.0015,
  premiumPlan: "free",
  operations: [],
  inviteCode: `F${Math.floor(10000 + Math.random() * 89999)}`,
  owned: Object.fromEntries(workers.map((worker) => [worker.level, 0])),
  tasks: initialTasks.map((task) => ({ ...task, done: false })),
};

const viewContainer = document.getElementById("viewContainer");
const balanceLabel = document.getElementById("balanceValue");
const toastEl = document.getElementById("toast");

function formatTon(value, maximumFractionDigits = 4) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  });
}

function getDisplayName() {
  const user = tg?.initDataUnsafe?.user;
  if (!user) return "Duck Worker";
  return [user.first_name, user.last_name].filter(Boolean).join(" ");
}

function getActivePlan() {
  return premiumPlans.find((plan) => plan.id === state.premiumPlan);
}

function getBoostMultiplier() {
  return getActivePlan()?.boost || 1;
}

function getTotalWorkersOwned() {
  return Object.values(state.owned).reduce((sum, item) => sum + item, 0);
}

function getDailyProfit() {
  const base = workers.reduce((sum, worker) => sum + worker.daily * state.owned[worker.level], 0);
  return base * getBoostMultiplier();
}

function getTotalProjection() {
  const base = workers.reduce((sum, worker) => sum + worker.total * state.owned[worker.level], 0);
  return base * getBoostMultiplier();
}

function getAvailableTaskReward() {
  return state.tasks.filter((task) => !task.done).reduce((sum, task) => sum + task.reward, 0);
}

function isUnlocked(level) {
  if (level === 1) return true;
  return state.owned[level - 1] > 0;
}

function haptic(type = "light") {
  tg?.HapticFeedback?.impactOccurred(type);
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function pushOperation(title, amount) {
  state.operations.unshift({
    title,
    amount,
    time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  });
  state.operations = state.operations.slice(0, 8);
}

function deposit(amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("Geçerli TON miktarı gir.");
    return;
  }
  state.balance += amount;
  pushOperation("Deposit", amount);
  showToast(`+${formatTon(amount)} TON yatırıldı`);
  render();
}

function withdraw(amount) {
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("Geçerli TON miktarı gir.");
    return;
  }
  if (amount > state.balance) {
    showToast("Yetersiz bakiye.");
    return;
  }
  state.balance -= amount;
  pushOperation("Withdraw", -amount);
  showToast(`${formatTon(amount)} TON çekim isteği alındı`);
  render();
}

function hireWorker(level) {
  const worker = workers.find((item) => item.level === level);
  if (!worker) return;
  if (!isUnlocked(level)) {
    showToast(`Önce LV.${level - 1} worker al.`);
    return;
  }
  if (state.owned[level] >= worker.stock) {
    showToast("Bu worker seviyesinde stok sınırına ulaştın.");
    return;
  }
  if (state.balance < worker.cost) {
    showToast(`${formatTon(worker.cost - state.balance)} TON eksik.`);
    return;
  }
  state.balance -= worker.cost;
  state.owned[level] += 1;
  pushOperation(`${worker.name} purchase`, -worker.cost);
  haptic("medium");
  showToast(`${worker.name} eklendi`);
  render();
}

function completeTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || task.done) return;
  task.done = true;
  state.balance += task.reward;
  pushOperation("Task reward", task.reward);
  window.open(task.link, "_blank", "noopener,noreferrer");
  showToast(`Task tamamlandı: +${formatTon(task.reward)} TON`);
  render();
}

function subscribeToPlan(planId) {
  const plan = premiumPlans.find((item) => item.id === planId);
  if (!plan) return;
  if (state.premiumPlan === plan.id) {
    showToast("Bu plan zaten aktif.");
    return;
  }
  if (state.balance < plan.price) {
    showToast(`Plan için ${formatTon(plan.price, 2)} TON gerekli.`);
    return;
  }
  state.balance -= plan.price;
  state.premiumPlan = plan.id;
  pushOperation(`${plan.name} subscribe`, -plan.price);
  showToast(`${plan.name} aktif oldu`);
  render();
}

function simulateReferral() {
  state.referrals += 1;
  state.balance += state.perInviteReward;
  pushOperation("Referral reward", state.perInviteReward);
  showToast("Yeni referral bonusu eklendi");
  render();
}

function workerButton(worker, owned, unlocked) {
  const affordable = state.balance >= worker.cost;
  const hasSlot = owned < worker.stock;
  if (!unlocked) return `<button class="action-btn secondary" disabled>🔒 LOCKED</button>`;
  if (affordable && hasSlot) return `<button class="action-btn primary" data-hire="${worker.level}">Hire worker</button>`;
  if (!hasSlot) return `<button class="action-btn secondary" disabled>Limit reached</button>`;
  return `<button class="action-btn secondary" disabled>Need ${formatTon(worker.cost, 3)} TON</button>`;
}

function renderEmpireView() {
  const dailyProfit = getDailyProfit();
  const totalProjection = getTotalProjection();
  const workerCards = workers
    .map((worker) => {
      const [c1, c2] = worker.colors;
      const owned = state.owned[worker.level];
      const unlocked = isUnlocked(worker.level);
      return `
        <article class="worker-card ${unlocked ? "" : "locked"}">
          <div class="worker-icon" style="background:linear-gradient(145deg, ${c1}, ${c2})">${worker.icon}</div>
          <div class="worker-info">
            <h3>${worker.name} <span class="level">LV.${worker.level}</span></h3>
            <div class="period">Period: 365 Days</div>
            <div class="worker-stats">
              <div><strong>COST</strong><span>💎 ${formatTon(worker.cost, 3)}</span></div>
              <div><strong>DAILY PROFIT</strong><span class="profit">💎 ${formatTon(worker.daily, 4)}</span></div>
              <div><strong>TOTAL PROFIT</strong><span>💎 ${formatTon(worker.total, 4)}</span></div>
            </div>
          </div>
          <div class="worker-cta">
            <div class="stock">${owned}/${worker.stock}</div>
            ${workerButton(worker, owned, unlocked)}
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <section class="panel profile-card">
      <div class="avatar"></div>
      <div class="profile-meta">
        <h2>${getDisplayName()}</h2>
        <p class="subtitle">Duck's Empire • New Member</p>
      </div>
      <div class="tag">${state.premiumPlan === "free" ? "Bronze" : "Premium"}</div>
    </section>

    <section class="stat-grid">
      <article class="panel stat-card">
        <div class="stat-label">Duck Workers</div>
        <div class="stat-value">${getTotalWorkersOwned()}</div>
      </article>
      <article class="panel stat-card">
        <div class="stat-label">Daily Profit</div>
        <div class="stat-value green">${formatTon(dailyProfit, 4)}</div>
      </article>
      <article class="panel stat-card">
        <div class="stat-label">Total Profit</div>
        <div class="stat-value">${formatTon(totalProjection, 4)}</div>
      </article>
    </section>

    <div class="section-title">Duck Workers</div>
    <section class="worker-list">${workerCards}</section>
  `;
}

function renderWalletView() {
  const operationRows = state.operations.length
    ? state.operations
        .map(
          (operation) => `
            <div class="invite-box">
              <div>
                <strong>${operation.title}</strong>
                <div class="tiny">${operation.time}</div>
              </div>
              <div class="${operation.amount >= 0 ? "op-amount-positive" : ""}">
                ${operation.amount >= 0 ? "+" : ""}${formatTon(operation.amount, 4)} TON
              </div>
            </div>
          `
        )
        .join("")
    : `<p class="tiny">Henüz işlem geçmişi yok.</p>`;

  return `
    <section class="wallet-card">
      <h2 class="panel-title">Wallet</h2>
      <p class="panel-subtitle">Invest, deposit and request withdrawals.</p>
      <div class="premium-price">
        <span>Current balance</span>
        <b>${formatTon(state.balance, 4)}</b>
      </div>
      <div class="wallet-actions">
        <input id="walletAmount" type="number" min="0" step="0.001" placeholder="Amount in TON (e.g. 0.25)" />
        <button id="depositBtn" class="action-btn primary block">Deposit</button>
        <button id="withdrawBtn" class="action-btn secondary block">Withdraw</button>
      </div>
    </section>
    <section class="wallet-card">
      <h3>Recent operations</h3>
      ${operationRows}
    </section>
  `;
}

function renderTasksView() {
  const categories = ["SOCIAL", "COLLABORATION"];
  const content = categories
    .map((category) => {
      const tasks = state.tasks.filter((task) => task.category === category);
      return `
        <div class="category-head">${category}</div>
        ${tasks
          .map(
            (task) => `
              <article class="task-card ${task.done ? "locked" : ""}">
                <div class="task-header">
                  <strong>${task.icon} ${task.title}</strong>
                  <span class="task-reward">💎 +${formatTon(task.reward, 3)}</span>
                </div>
                <div class="tiny">${task.description}</div>
                <button class="action-btn ${task.done ? "secondary" : "blue"} block" data-task="${task.id}" ${
                  task.done ? "disabled" : ""
                }>
                  ${task.done ? "Completed" : "Join"}
                </button>
              </article>
            `
          )
          .join("")}
      `;
    })
    .join("");

  return `
    <section class="wallet-card">
      <h2 class="panel-title">Tasks</h2>
      <p class="panel-subtitle">Complete missions to earn TON.</p>
      <div class="premium-price">
        <span>Available rewards</span>
        <b>+${formatTon(getAvailableTaskReward(), 4)}</b>
      </div>
    </section>
    ${content}
  `;
}

function renderFriendsView() {
  const referralRevenue = state.referrals * state.perInviteReward;
  const inviteLink = `https://t.me/DucksEmpire_Bot?start=${state.inviteCode}`;
  return `
    <section class="referral-card">
      <h2 class="panel-title">Referrals</h2>
      <p class="panel-subtitle">Earn from every friend you invite.</p>
      <div class="referral-grid">
        <article class="ref-mini">
          <div class="tiny">Your referrals</div>
          <div class="stat-value">${state.referrals}</div>
          <div class="tiny">friends</div>
        </article>
        <article class="ref-mini">
          <div class="tiny">Per invite</div>
          <div class="stat-value">💎 ${formatTon(state.perInviteReward, 4)}</div>
          <div class="tiny">TON reward</div>
        </article>
      </div>
      <div class="panel-row">
        <article class="panel-box">
          <strong>10% Deposit Commission</strong>
          <p class="tiny">Earn 10% of your referrals deposits automatically with no cap.</p>
        </article>
      </div>
      <div class="section-title">How it works</div>
      <div class="referral-grid">
        <article class="ref-mini"><strong>Invite</strong><div class="tiny">Friend joins via your link</div></article>
        <article class="ref-mini"><strong>Earn</strong><div class="tiny">Get TON bonus instantly</div></article>
        <article class="ref-mini"><strong>Commission</strong><div class="tiny">10% of their deposits</div></article>
        <article class="ref-mini"><strong>Tasks</strong><div class="tiny">Unlock referral milestones</div></article>
      </div>
      <div class="section-title">Your invite link</div>
      <div class="invite-box">
        <span class="invite-link">${inviteLink}</span>
        <button id="copyInvite" class="action-btn secondary">Copy</button>
      </div>
      <div class="panel-row">
        <button id="shareTelegram" class="action-btn primary block">Share to Telegram</button>
        <button id="simulateReferral" class="action-btn secondary block">+1</button>
      </div>
    </section>
    <section class="wallet-card">
      <h3>Referral income snapshot</h3>
      <p class="subtitle">Current bonus pool: ${formatTon(referralRevenue, 4)} TON</p>
    </section>
  `;
}

function renderPremiumView() {
  const activePlan = getActivePlan();
  const cards = premiumPlans
    .map((plan) => {
      const active = plan.id === state.premiumPlan;
      return `
        <article class="premium-card">
          <div class="task-header">
            <h3>${plan.name}</h3>
            <span class="task-reward">${plan.badge}</span>
          </div>
          <div class="tiny">${plan.period}</div>
          <div class="premium-price">
            <span>Price</span>
            <b>${formatTon(plan.price, 2)} TON</b>
          </div>
          <div class="tiny">Was: <s>${formatTon(plan.oldPrice, 2)} TON</s></div>
          <ul class="premium-list">
            ${plan.perks.map((perk) => `<li>${perk}</li>`).join("")}
          </ul>
          <button class="action-btn primary block" data-subscribe="${plan.id}" ${active ? "disabled" : ""}>
            ${active ? "Current plan" : `Subscribe - ${formatTon(plan.price, 2)} TON`}
          </button>
        </article>
      `;
    })
    .join("");

  return `
    <section class="wallet-card">
      <h2 class="panel-title">Premium Access</h2>
      <p class="panel-subtitle">Boost earnings and automate your profit growth.</p>
      <div class="premium-price">
        <span>Active status</span>
        <b>${activePlan?.name || "Free Plan"}</b>
      </div>
      <p class="tiny">Current multiplier: x${formatTon(getBoostMultiplier(), 2)}</p>
    </section>
    ${cards}
  `;
}

function renderCurrentView() {
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

function bindEmpireActions() {
  viewContainer.querySelectorAll("[data-hire]").forEach((button) => {
    button.addEventListener("click", () => {
      const level = Number(button.getAttribute("data-hire"));
      hireWorker(level);
    });
  });
}

function bindWalletActions() {
  const amountInput = document.getElementById("walletAmount");
  const depositButton = document.getElementById("depositBtn");
  const withdrawButton = document.getElementById("withdrawBtn");
  if (!amountInput || !depositButton || !withdrawButton) return;
  const value = () => Number(amountInput.value.replace(",", "."));
  depositButton.addEventListener("click", () => deposit(value()));
  withdrawButton.addEventListener("click", () => withdraw(value()));
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

function bindFriendsActions() {
  const copyButton = document.getElementById("copyInvite");
  const shareButton = document.getElementById("shareTelegram");
  const simulateButton = document.getElementById("simulateReferral");

  if (copyButton) {
    copyButton.addEventListener("click", async () => {
      const link = viewContainer.querySelector(".invite-link")?.textContent || "";
      try {
        await navigator.clipboard.writeText(link);
        showToast("Invite link copied");
      } catch (_error) {
        showToast("Copy is not supported");
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
    simulateButton.addEventListener("click", () => simulateReferral());
  }
}

function bindPremiumActions() {
  viewContainer.querySelectorAll("[data-subscribe]").forEach((button) => {
    button.addEventListener("click", () => {
      const planId = button.getAttribute("data-subscribe");
      if (!planId) return;
      subscribeToPlan(planId);
    });
  });
}

function bindViewActions() {
  if (state.activeTab === "empire") bindEmpireActions();
  if (state.activeTab === "wallet") bindWalletActions();
  if (state.activeTab === "tasks") bindTaskActions();
  if (state.activeTab === "friends") bindFriendsActions();
  if (state.activeTab === "premium") bindPremiumActions();
}

function render() {
  balanceLabel.textContent = formatTon(state.balance, 4);
  viewContainer.innerHTML = renderCurrentView();
  bindViewActions();
}

function initNav() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelector(".nav-item.active")?.classList.remove("active");
      item.classList.add("active");
      state.activeTab = item.getAttribute("data-tab") || "empire";
      haptic("light");
      render();
    });
  });
}

function initQuickDeposit() {
  const quickDeposit = document.getElementById("quickDeposit");
  if (!quickDeposit) return;
  quickDeposit.addEventListener("click", () => deposit(0.25));
}

initNav();
initQuickDeposit();
render();
