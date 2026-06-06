import { showStatus } from "../../utils/status.js";
import { GAS_URL } from "../../config.js";

let dashboardLoaded = false;

function setDashboardLoading(isLoading) {
  const ids = ["totalSale", "salesIncome", "operationalExpense", "grossProfit"];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    if (isLoading) {
      el.classList.add("skeleton");
      el.textContent = "██████";
    } else {
      el.classList.remove("skeleton");
    }
  });
}

function setDashboardValues(data) {
  setDashboardLoading(false);

  document.getElementById("totalSale").textContent =
    "₹" + Number(data.totalSale).toLocaleString("en-IN");

  document.getElementById("salesIncome").textContent =
    "₹" + Number(data.salesIncome).toLocaleString("en-IN");

  document.getElementById("operationalExpense").textContent =
    "₹" + Number(data.operationalExpense).toLocaleString("en-IN");

  document.getElementById("grossProfit").textContent =
    "₹" + Number(data.grossProfit).toLocaleString("en-IN");
}

async function loadDashboard() {
  if (dashboardLoaded) return;

  setDashboardLoading(true);

  try {
    const res = await fetch(GAS_URL + "?action=getDashboardData");
    const data = await res.json();

    if (!data.success) {
      throw new Error(data.error || "Unable to fetch data");
    }

    setDashboardValues(data.data);
    dashboardLoaded = true;
    setDashboardLoading(false);
  } catch (err) {
    showStatus(err, true);
  }
}

async function refreshDashboard() {
  setDashboardLoading(true);

  const icon = document.getElementById("dashboardRefreshIcon");

  icon.classList.add("dashboard-syncing");

  try {
    const res = await fetch(GAS_URL + "?action=getDashboardData");

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to refresh dashboard");
    }

    setDashboardValues(response.data);

    showStatus("Dashboard updated");
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    icon.classList.remove("dashboard-syncing");
  }
}

export function initDashboard() {
  document
    .getElementById("dashboardRefreshFab")
    .addEventListener("click", refreshDashboard);
}

export const dashboard = {
  onEnter() {
    console.log("Entered dashboard");

    loadDashboard();
  },
};
