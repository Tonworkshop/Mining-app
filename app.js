const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  tg.setHeaderColor("#0b1018");
  tg.setBackgroundColor("#05090e");
}

const state = {
  activeTab: "miner",
  balance: 0.058024,
  powerGpu: 30000,
  minedHashes: 181.53673,
  hashRate: 10,
  nodeHealth: 97.4,
  activeNodes: 6,
  spendUsd: 3,
  firstDepositBonus: true,
  machineLevel: 1,
  selectedWithdraw: "TON",
  tasks: [
    { id: "t1", title: "Invite 50 friends", rewardGpu: 5500, current: 36, target: 50, icon: "✈" },
    { id: "t2", title: "Invite 100 friends", rewardGpu: 13250, current: 36, target: 100, icon: "✈" },
    { id: "t3", title: "Invite 200 friends", rewardGpu: 32500, current: 36, target: 200, icon: "✈" },
    { id: "t4", title: "Top Up Balance: $5", rewardGpu: 10000, current: 0, target: 5, icon: "▦" },
  ],
  operations: [],
};

const withdrawMethods = [
  { key: "TRON", name: "TRON", network: "Tron", min: 0.02, symbol: "🔴" },
  { key: "BNB", name: "BNB", network: "BEP 20", min: 0.02, symbol: "🟡" },
  { key: "TON", name: "TON Coin", network: "TON", min: 0.02, symbol: "🔵" },
  { key: "LTC", name: "Litecoin", network: "LTC", min: 0.05, symbol: "🔷" },
];

const viewContainer = document.getElementById("viewContainer");
const balanceLabel = document.getElementById("balanceValue");
const toastEl = document.getElementById("toast");

function formatNumber(value, maxFraction = 2) {
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFraction,
  });
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toastEl.classList.remove("show"), 1800);
}

function haptic(kind = "light") {
  tg?.HapticFeedback?.impactOccurred(kind);
}

function pushOperation(type, amount) {
  state.operations.unshift({
    type,
    amount,
    time: new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
  });
  state.operations = state.operations.slice(0, 6);
}

function getPowerFromSpend() {
  return state.spendUsd * 10000;
}

function getFirstDepositBonus() {
  return state.firstDepositBonus ? getPowerFromSpend() * 0.25 : 0;
}

function getTotalPowerAfterBuy() {
  return getPowerFromSpend() + getFirstDepositBonus();
}

function getInterestRate() {
  return 1.92;
}

function getDailyProfitHashes() {
  return (state.powerGpu / 10000) * 244;
}

function getMonthlyProfitHashes() {
  return getDailyProfitHashes() * 30;
}

function getSixMonthProfitHashes() {
  return getMonthlyProfitHashes() * 6;
}

function buyPower() {
  const spend = Number(state.spendUsd);
  if (!Number.isFinite(spend) || spend <= 0) {
    showToast("Geçerli USD miktarı gir.");
    return;
  }
  const totalPower = getTotalPowerAfterBuy();
  const balanceCost = spend / 100;
  if (state.balance < balanceCost) {
    showToast(`Yetersiz bakiye. ${formatNumber(balanceCost, 4)} TON gerekli.`);
    return;
  }
  state.balance -= balanceCost;
  state.powerGpu += totalPower;
  state.firstDepositBonus = false;
  pushOperation("Power purchase", -balanceCost);
  haptic("medium");
  showToast(`${formatNumber(totalPower, 0)} GPU eklendi`);
  render();
}

function exchangeHashes() {
  if (state.minedHashes < 1) {
    showToast("Exchange için yeterli hash yok.");
    return;
  }
  const exchanged = Math.min(state.minedHashes, 25);
  state.minedHashes -= exchanged;
  const ton = exchanged / 200;
  state.balance += ton;
  pushOperation("Hashes exchanged", ton);
  showToast(`${formatNumber(exchanged, 2)} Hash -> +${formatNumber(ton, 4)} TON`);
  render();
}

function requestWithdraw() {
  const amountInput = document.getElementById("withdrawAmount");
  const amount = Number(amountInput?.value || 0);
  const method = withdrawMethods.find((item) => item.key === state.selectedWithdraw);
  if (!method) return;
  if (!Number.isFinite(amount) || amount <= 0) {
    showToast("Geçerli çekim tutarı gir.");
    return;
  }
  if (amount < method.min) {
    showToast(`Minimum çekim: ${method.min} USDT`);
    return;
  }
  if (amount > state.balance) {
    showToast("Yetersiz bakiye.");
    return;
  }
  state.balance -= amount;
  pushOperation(`Withdraw ${method.name}`, -amount);
  showToast(`${method.name} çekim talebi alındı`);
  render();
}

function simulateEarn() {
  const gain = getDailyProfitHashes() / 1440;
  state.minedHashes += gain;
  showToast(`+${formatNumber(gain, 3)} Hash mined`);
  render();
}

function completeTask(taskId) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;
  if (task.current >= task.target) {
    showToast("Bu görev zaten tamamlandı.");
    return;
  }
  task.current = Math.min(task.target, task.current + Math.ceil(task.target * 0.14));
  if (task.current >= task.target) {
    state.powerGpu += task.rewardGpu;
    showToast(`Task complete! +${formatNumber(task.rewardGpu, 0)} GPU`);
    pushOperation("Task reward", task.rewardGpu / 100000);
  } else {
    showToast("İlerleme artırıldı.");
  }
  render();
}

function getViewTitle() {
  if (state.activeTab === "power") return "Power Shop";
  if (state.activeTab === "earn") return "Earnings";
  if (state.activeTab === "miner") return "Miner";
  if (state.activeTab === "withdraw") return "Withdraw";
  return "Tasks";
}

function getViewDescription() {
  if (state.activeTab === "power") return "Enter the sum you want to use for buying mining power.";
  if (state.activeTab === "earn") return "Track rewards and operation history.";
  if (state.activeTab === "miner") return "Live mining operations and performance overview.";
  if (state.activeTab === "withdraw") return "Choose a secure and convenient payout method.";
  return "Complete tasks to increase mining capacity.";
}

function renderTopPanel() {
  return `
    <section class="hero-card">
      <h2>${getViewTitle()}</h2>
      <p>${getViewDescription()}</p>
    </section>
  `;
}

function renderPowerView() {
  return `
    ${renderTopPanel()}
    <section class="panel power-panel">
      <div class="input-line">
        <input id="usdAmount" class="amount-input" type="number" min="1" step="1" value="${state.spendUsd}" />
        <span class="unit">USD</span>
      </div>
      <div class="calc-title">PROFIT CALCULATOR</div>
      <div class="calc-card">
        <div class="calc-row"><span>Power:</span><strong>${formatNumber(getPowerFromSpend(), 0)} GPU</strong></div>
        <div class="calc-row green"><span>+25% for 1st deposit:</span><strong>${formatNumber(getFirstDepositBonus(), 0)} GPU</strong></div>
        <div class="calc-row yellow"><span>Total power:</span><strong>${formatNumber(getTotalPowerAfterBuy(), 0)} GPU</strong></div>
        <div class="calc-row"><span>Interest rate:</span><strong>${formatNumber(getInterestRate(), 2)}% Profit per day</strong></div>
        <div class="calc-row"><span>Profit per day:</span><strong>${formatNumber(getDailyProfitHashes(), 0)} Hash</strong></div>
        <div class="calc-row"><span>Profit per month:</span><strong>${formatNumber(getMonthlyProfitHashes(), 0)} Hash</strong></div>
        <div class="calc-row"><span>Profit over 6 months:</span><strong>${formatNumber(getSixMonthProfitHashes(), 0)} Hash</strong></div>
      </div>
      <button id="buyPowerBtn" class="primary-btn">PAY</button>
    </section>

    <section class="panel unlock-panel">
      <div>
        <h3>Next mining machine</h3>
        <p>Power to unlock: ${formatNumber((state.machineLevel + 1) * 226400, 0)} GPU</p>
      </div>
      <div class="machine-art">🖥</div>
      <button class="ghost-btn" id="unlockBtn">UNLOCK</button>
    </section>
  `;
}

function renderMinerView() {
  const dailyYieldTon = getDailyProfitHashes() / 200;
  return `
    <section class="panel live-miner-panel">
      <div class="live-miner-head">
        <div>
          <div class="live-title">Active Mining</div>
          <p class="live-subtitle">All nodes are synchronized and mining continuously.</p>
        </div>
        <span class="live-badge">ONLINE</span>
      </div>
      <div class="miner-visual">
        <div class="miner-rotor"></div>
      </div>
      <div class="live-metrics">
        <article>
          <small>Hash Rate</small>
          <strong>${state.hashRate} H/s</strong>
        </article>
        <article>
          <small>Node Health</small>
          <strong>${formatNumber(state.nodeHealth, 1)}%</strong>
        </article>
        <article>
          <small>Active Nodes</small>
          <strong>${state.activeNodes}</strong>
        </article>
        <article>
          <small>Daily Yield</small>
          <strong>${formatNumber(dailyYieldTon, 3)} TON</strong>
        </article>
      </div>
      <div class="system-progress">
        <div class="system-progress-head">
          <span>Node synchronization</span>
          <b>${formatNumber(state.nodeHealth, 1)}%</b>
        </div>
        <div class="progress-track"><span style="width:${state.nodeHealth}%"></span></div>
      </div>
    </section>
    <section class="panel miner-actions-panel">
      <div class="stats-line"><span>Current power</span><strong>${formatNumber(state.powerGpu, 0)} GPU</strong></div>
      <div class="stats-line compact"><span>Live network rate</span><strong>${state.hashRate} H/s</strong></div>
      <button class="accent-btn" data-tab-jump="power">Buy power in the store</button>
      <p class="footnote">Mining process is running with adaptive load balancing and stable throughput.</p>
      <div class="row-btns">
        <button id="boostNodesBtn" class="primary-btn">Boost Nodes</button>
        <button id="diagnoseBtn" class="ghost-btn">Diagnostics</button>
      </div>
    </section>
    <section class="panel">
      <div class="task-mini">
        <div class="task-icon">✈</div>
        <div>
          <strong>Invite 50 friends</strong>
          <p>Reward: 5500 GPU</p>
        </div>
        <div class="chip-progress">${state.tasks[0].current}/${state.tasks[0].target}</div>
      </div>
    </section>
  `;
}

function renderWithdrawView() {
  const methodsHtml = withdrawMethods
    .map((method) => {
      const active = state.selectedWithdraw === method.key;
      return `
        <button class="withdraw-method ${active ? "active" : ""}" data-method="${method.key}">
          <div class="method-head">
            <span>${method.symbol}</span>
            <strong>${method.name}</strong>
          </div>
          <div class="method-sub">${method.network}</div>
          <div class="method-min">[Min. ${method.min} USDT]</div>
        </button>
      `;
    })
    .join("");

  return `
    ${renderTopPanel()}
    <section class="panel promo-bar">
      Pay using the balance to increase power and receive a bonus +5%!
      <button class="ghost-btn mini" data-tab-jump="power">MORE DETAILS</button>
    </section>
    <section class="panel">
      <h2 class="section-heading">Withdraw funds</h2>
      <p class="section-caption">Choose a convenient withdrawal method:</p>
      <div class="methods-grid">${methodsHtml}</div>
      <div class="withdraw-form">
        <input id="withdrawAmount" type="number" min="0" step="0.001" placeholder="Amount (USDT / TON)" />
        <button id="withdrawBtn" class="primary-btn">Request Withdraw</button>
      </div>
    </section>
  `;
}

function renderTasksView() {
  const friendTasks = state.tasks.slice(0, 3);
  const bonusTask = state.tasks[3];
  const taskRow = (task) => {
    const percent = Math.max(0, Math.min(100, (task.current / task.target) * 100));
    return `
      <article class="task-row">
        <div class="task-icon">${task.icon}</div>
        <div class="task-body">
          <strong>${task.title}</strong>
          <p>Reward: ${formatNumber(task.rewardGpu, 0)} GPU</p>
          <div class="progress-track"><span style="width:${percent}%"></span></div>
        </div>
        <button class="chip-progress" data-task="${task.id}">${task.current} / ${task.target}</button>
      </article>
    `;
  };

  return `
    ${renderTopPanel()}
    <section class="panel">
      <h2 class="section-heading center">Complete Tasks to<br />earn more</h2>
      <div class="task-group-title">FRIENDS</div>
      ${friendTasks.map((task) => taskRow(task)).join("")}
      <div class="task-group-title">TOP UP BONUS</div>
      ${taskRow(bonusTask)}
    </section>
  `;
}

function renderEarnView() {
  const incomePerHour = getDailyProfitHashes() / 24;
  const history = state.operations.length
    ? state.operations
        .map(
          (op) => `
            <div class="op-row">
              <div><strong>${op.type}</strong><p>${op.time}</p></div>
              <span class="${op.amount >= 0 ? "plus" : "minus"}">${op.amount >= 0 ? "+" : ""}${formatNumber(op.amount, 4)}</span>
            </div>`
        )
        .join("")
    : `<p class="section-caption">Henüz işlem yok.</p>`;

  return `
    ${renderTopPanel()}
    <section class="panel">
      <h2 class="section-heading">Earnings center</h2>
      <div class="metrics-grid">
        <div class="metric-box"><span>Per hour</span><strong>${formatNumber(incomePerHour, 2)} Hash</strong></div>
        <div class="metric-box"><span>Per day</span><strong>${formatNumber(getDailyProfitHashes(), 2)} Hash</strong></div>
        <div class="metric-box"><span>Mined</span><strong>${formatNumber(state.minedHashes, 5)} Hash</strong></div>
        <div class="metric-box"><span>Power</span><strong>${formatNumber(state.powerGpu, 0)} GPU</strong></div>
      </div>
      <div class="row-btns">
        <button id="claimEarnBtn" class="primary-btn">Claim small mine</button>
        <button id="jumpMinerBtn" class="ghost-btn">Go Miner</button>
      </div>
    </section>
    <section class="panel">
      <h3 class="section-heading">Recent activity</h3>
      ${history}
    </section>
  `;
}

function renderView() {
  if (state.activeTab === "power") return renderPowerView();
  if (state.activeTab === "earn") return renderEarnView();
  if (state.activeTab === "miner") return renderMinerView();
  if (state.activeTab === "withdraw") return renderWithdrawView();
  return renderTasksView();
}

function bindPowerActions() {
  const usdInput = document.getElementById("usdAmount");
  const buyButton = document.getElementById("buyPowerBtn");
  const unlockButton = document.getElementById("unlockBtn");
  if (usdInput) {
    usdInput.addEventListener("input", () => {
      state.spendUsd = Number(usdInput.value || 0);
      render();
    });
  }
  if (buyButton) buyButton.addEventListener("click", buyPower);
  if (unlockButton) {
    unlockButton.addEventListener("click", () => {
      const need = (state.machineLevel + 1) * 226400;
      if (state.powerGpu >= need) {
        state.machineLevel += 1;
        showToast(`Machine LV.${state.machineLevel} unlocked`);
      } else {
        showToast(`Need ${formatNumber(need - state.powerGpu, 0)} GPU more`);
      }
      render();
    });
  }
}

function bindMinerActions() {
  const boostNodesBtn = document.getElementById("boostNodesBtn");
  const diagnoseBtn = document.getElementById("diagnoseBtn");
  const jumpPower = document.querySelector("[data-tab-jump='power']");
  if (boostNodesBtn) {
    boostNodesBtn.addEventListener("click", () => {
      state.nodeHealth = Math.min(99.9, state.nodeHealth + 0.4);
      state.activeNodes = Math.min(12, state.activeNodes + 1);
      state.minedHashes += 1.4;
      showToast("Mining nodes boosted");
      render();
    });
  }
  if (diagnoseBtn) {
    diagnoseBtn.addEventListener("click", () => {
      haptic("medium");
      showToast("System diagnostics: all nodes healthy");
    });
  }
  if (jumpPower) {
    jumpPower.addEventListener("click", () => switchTab("power"));
  }
}

function bindWithdrawActions() {
  viewContainer.querySelectorAll("[data-method]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedWithdraw = button.getAttribute("data-method") || "TON";
      render();
    });
  });
  const withdrawBtn = document.getElementById("withdrawBtn");
  if (withdrawBtn) withdrawBtn.addEventListener("click", requestWithdraw);
  const moreDetails = document.querySelector("[data-tab-jump='power']");
  if (moreDetails) moreDetails.addEventListener("click", () => switchTab("power"));
}

function bindTasksActions() {
  viewContainer.querySelectorAll("[data-task]").forEach((button) => {
    button.addEventListener("click", () => {
      const taskId = button.getAttribute("data-task");
      if (!taskId) return;
      completeTask(taskId);
    });
  });
}

function bindEarnActions() {
  const claim = document.getElementById("claimEarnBtn");
  const goMiner = document.getElementById("jumpMinerBtn");
  if (claim) claim.addEventListener("click", simulateEarn);
  if (goMiner) goMiner.addEventListener("click", () => switchTab("miner"));
}

function bindViewActions() {
  if (state.activeTab === "power") bindPowerActions();
  if (state.activeTab === "miner") bindMinerActions();
  if (state.activeTab === "withdraw") bindWithdrawActions();
  if (state.activeTab === "tasks") bindTasksActions();
  if (state.activeTab === "earn") bindEarnActions();
}

function switchTab(tab) {
  document.querySelector(".nav-item.active")?.classList.remove("active");
  const next = document.querySelector(`.nav-item[data-tab='${tab}']`);
  if (next) next.classList.add("active");
  state.activeTab = tab;
  haptic("light");
  render();
}

function render() {
  balanceLabel.textContent = formatNumber(state.balance, 6);
  viewContainer.innerHTML = renderView();
  bindViewActions();
}

function initNavigation() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button.getAttribute("data-tab") || "power");
    });
  });
}

function initTopActions() {
  const quickDeposit = document.getElementById("quickDeposit");
  if (!quickDeposit) return;
  quickDeposit.addEventListener("click", () => {
    state.balance += 0.03;
    pushOperation("Quick top up", 0.03);
    showToast("Balance topped up +0.03");
    render();
  });
}

initNavigation();
initTopActions();
render();
