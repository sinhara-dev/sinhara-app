import { showStatus } from "../../utils/status.js";
import { getCurrentDate, getCurrentMonthName } from "../../utils/utils.js";
import { http } from "../../services/http.js";

export const dashboardCache = {};
let selectedDate = getCurrentDate();

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

function saveDashboardCache() {
  localStorage.setItem("dashboardCache", JSON.stringify(dashboardCache));
}

function loadDashboardCache() {
  Object.assign(
    dashboardCache,
    JSON.parse(localStorage.getItem("dashboardCache") || "{}"),
  );
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

async function getDashboardDataFromServer(year, month) {
  const res = await http.Get("getDashboardData", {
    year,
    month,
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Unable to fetch data");
  }

  return data.data;
}

async function loadDashboard(year, month) {
  const cacheKey = `${year}-${month}`;
  if (dashboardCache[cacheKey]) {
    setDashboardValues(dashboardCache[cacheKey]);
    return;
  }

  setDashboardLoading(true);

  try {
    const data = await getDashboardDataFromServer(year, month);

    setDashboardValues(data);
    setDashboardLoading(false);
    dashboardCache[cacheKey] = data;
    saveDashboardCache();
  } catch (error) {
    console.error(error);
    showStatus(error.message, true);
    clearDashboard();
  } finally {
    setDashboardLoading(false);
  }
}

async function refreshDashboard(year, month) {
  setDashboardLoading(true);

  const icon = document.getElementById("dashboardRefreshIcon");

  icon.classList.add("dashboard-syncing");

  try {
    const data = await getDashboardDataFromServer(year, month);

    setDashboardValues(data);

    showStatus("Dashboard updated");

    const cacheKey = `${year}-${month}`;
    delete dashboardCache[cacheKey];
    dashboardCache[cacheKey] = data;

    saveDashboardCache();
  } catch (error) {
    console.error(error);
    showStatus(error.message, true);
    clearDashboard();
  } finally {
    icon.classList.remove("dashboard-syncing");
    setDashboardLoading(false);
  }
}

export function initDashboard() {
  loadDashboardCache();
  const month = getCurrentMonthName();
  const year = new Date().getFullYear();
  document
    .getElementById("dashboardRefreshFab")
    .addEventListener("click", () => {
      refreshDashboard(year, month);
    });

  const dashboardMonth = document.getElementById("dashboardMonth");

  dashboardMonth.addEventListener("change", () => {
    const date = new Date(`${dashboardMonth.value}-01`);
    if (selectedDate === date) return;

    selectedDate = date;

    const monthName = date.toLocaleString("en-US", {
      month: "long",
    });

    loadDashboard(date.getFullYear(), monthName);
  });
}

function clearDashboard() {
  document.getElementById("totalSale").innerText = "₹--";
  document.getElementById("salesIncome").innerText = "₹--";
  document.getElementById("operationalExpense").innerText = "₹--";
  document.getElementById("grossProfit").innerText = "₹--";
}

export const dashboard = {
  onEnter() {
    loadDashboard(
      selectedDate.getFullYear(),
      selectedDate.toLocaleString("en-US", {
        month: "long",
      }),
    );
  },
};
