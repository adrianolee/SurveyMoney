const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("app.js", "utf8");

const appEl = { innerHTML: "" };
const toastEl = {
  textContent: "",
  classList: {
    values: new Set(),
    add(value) { this.values.add(value); },
    remove(value) { this.values.delete(value); },
    contains(value) { return this.values.has(value); }
  }
};

const storage = new Map();
const context = {
  console,
  setTimeout,
  clearTimeout,
  Math,
  Date,
  JSON,
  Number,
  String,
  RegExp,
  Array,
  Object,
  Error,
  URLSearchParams,
  localStorage: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    },
    removeItem(key) {
      storage.delete(key);
    },
    clear() {
      storage.clear();
    }
  },
  location: { hash: "#/home", search: "", href: "" },
  window: {
    addEventListener() {}
  },
  document: {
    getElementById(id) {
      if (id === "app") return appEl;
      if (id === "toast") return toastEl;
      return null;
    },
    addEventListener() {}
  }
};

vm.createContext(context);
vm.runInContext(source, context, { filename: "app.js" });

const result = vm.runInContext(`
(() => {
  localStorage.clear();
  const state = loadState();
  const welcomeReward = claimWelcomeBonusState(state);
  const quickRewards = [];
  for (let i = 0; i < 20; i += 1) quickRewards.push(completeQuickSetState(state));
  const premiumRewards = [];
  for (let i = 0; i < 10; i += 1) premiumRewards.push(completePremiumSetState(state));

  const balanceBeforeSpin = state.withdrawableBalance;
  state.availableSpins -= 1;
  applySpinRewardState(state, { type: "bonus_cash", amount: 0.10 });
  const spinDidNotAffectWithdrawable = state.withdrawableBalance === balanceBeforeSpin;
  const spinLabels = spinRewards.map(reward => reward.label).join("|");
  const spinAlignment = spinRewards.every((reward, index) => {
    const finalRotation = calculateSpinTargetRotation(reward, 0);
    const pointerAngle = normalizeDegrees(-normalizeDegrees(finalRotation));
    return Math.floor(pointerAngle / WHEEL_SEGMENT_DEGREES) === index;
  });
  transient.spinResult = { type: "try_again", amount: 0 };
  const tryAgainModal = spinResultModal();
  const tryAgainModalCopyOk = tryAgainModal.includes("Try Again") && !tryAgainModal.includes('result-amount">Bonus');
  transient.spinResult = null;
  const monetizationConfig = getMonetizationConfig();
  const monetizationShown = showMonetizationInterstitial("/quick-complete");
  const monetizationHtml = document.getElementById("app").innerHTML;
  const monetizationOverlayOk = monetizationShown
    && transient.interstitial.nextRoute === "/quick-complete"
    && transient.interstitial.url === "https://ap9hqw.minigame.com/main"
    && transient.interstitial.title === "Earn more cash by playing games"
    && transient.interstitial.closeText === "X"
    && monetizationHtml.includes('class="interstitial-frame"')
    && monetizationHtml.includes('src="https://ap9hqw.minigame.com/main"');
  transient.interstitial = null;

  const spinGameUrlTemplate = buildSpinGameUrl("", "#/home");
  const spinGameUrlWithGaid = buildSpinGameUrl("?gaid=qa device/id", "#/home");
  const spinGameUrlWithDid = buildSpinGameUrl("", "#/home?did=hash-device");
  location.search = "?gaid=click-device";
  handleClick({ target: { closest: () => ({ dataset: { action: "spinPage" } }) } });
  const spinClickUrl = location.href;
  location.search = "";

  transient.withdrawAmount = "100.00";
  transient.withdrawEmail = "qa@example.com";
  const withdrawError = submitWithdrawal(state);

  return {
    welcomeReward,
    quickCompletedCount: state.quickCompletedCount,
    quickTotalReward: state.quickTotalReward,
    quickLastReward: quickRewards[quickRewards.length - 1],
    premiumCompletedCount: state.premiumCompletedCount,
    premiumCompletedSets: state.premiumCompletedSets,
    premiumTotalReward: state.premiumTotalReward,
    balanceBeforeSpin,
    bonusBalance: state.bonusBalance,
    spinDidNotAffectWithdrawable,
    spinLabels,
    spinAlignment,
    tryAgainModalCopyOk,
    monetizationUrl: monetizationConfig.interstitialUrl,
    monetizationOverlayOk,
    spinGameUrlTemplate,
    spinGameUrlWithGaid,
    spinGameUrlWithDid,
    spinClickUrl,
    withdrawError,
    balanceAfterWithdraw: state.withdrawableBalance,
    withdrawalRecords: state.withdrawalRecords.length
  };
})()
`, context);

const expected = {
  welcomeReward: 18.88,
  quickCompletedCount: 100,
  quickTotalReward: 21.12,
  quickLastReward: 2.12,
  premiumCompletedCount: 100,
  premiumCompletedSets: 10,
  premiumTotalReward: 60,
  balanceBeforeSpin: 100,
  bonusBalance: 0.1,
  spinDidNotAffectWithdrawable: true,
  spinLabels: "$0.01|$0.02|$0.03|$0.05|$0.10|Bonus|Extra|Try",
  spinAlignment: true,
  tryAgainModalCopyOk: true,
  monetizationUrl: "https://ap9hqw.minigame.com/main",
  monetizationOverlayOk: true,
  spinGameUrlTemplate: "https://s.arventrat.com/tml?pid=22211&appk=74LD42Jk2xXhhSRlKOTc5wsFHgIVLpct&did=",
  spinGameUrlWithGaid: "https://s.arventrat.com/tml?pid=22211&appk=74LD42Jk2xXhhSRlKOTc5wsFHgIVLpct&did=qa%20device%2Fid",
  spinGameUrlWithDid: "https://s.arventrat.com/tml?pid=22211&appk=74LD42Jk2xXhhSRlKOTc5wsFHgIVLpct&did=hash-device",
  spinClickUrl: "https://s.arventrat.com/tml?pid=22211&appk=74LD42Jk2xXhhSRlKOTc5wsFHgIVLpct&did=click-device",
  withdrawError: "",
  balanceAfterWithdraw: 0,
  withdrawalRecords: 1
};

const failures = Object.entries(expected)
  .filter(([key, value]) => result[key] !== value)
  .map(([key, value]) => `${key}: expected ${value}, got ${result[key]}`);

if (failures.length) {
  console.error("QA smoke failed");
  console.error(JSON.stringify(result, null, 2));
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("QA smoke passed");
console.log(JSON.stringify(result, null, 2));
