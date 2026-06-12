import { showStatus } from "../../utils/status.js";
import { getCurrentMonthName } from "../../utils/utils.js";
import { http } from "../../services/http.js";

export const dashboardCache = {};
let selectedMonth = "";

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

async function getDashboardDataFromServer(month) {
  // const res = await fetch(
  //   GAS_URL +
  //     "?action=getDashboardData" +
  //     "&month=" +
  //     encodeURIComponent(month),
  // );

  const res = await http.Get("getDashboardData", {
    month,
  });
  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error || "Unable to fetch data");
  }

  return data.data;
}

async function loadDashboard(month) {
  if (dashboardCache[month]) {
    setDashboardValues(dashboardCache[month]);
    return;
  }

  setDashboardLoading(true);

  try {
    const data = await getDashboardDataFromServer(month);

    setDashboardValues(data);
    setDashboardLoading(false);
    dashboardCache[month] = data;
    saveDashboardCache();
  } catch (err) {
    showStatus(err, true);
  } finally {
    setDashboardLoading(false);
  }
}

async function refreshDashboard(month) {
  setDashboardLoading(true);

  const icon = document.getElementById("dashboardRefreshIcon");

  icon.classList.add("dashboard-syncing");

  try {
    const data = await getDashboardDataFromServer(month);

    setDashboardValues(data);

    showStatus("Dashboard updated");
    delete dashboardCache[month];
    dashboardCache[month] = data;
    saveDashboardCache();
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    icon.classList.remove("dashboard-syncing");
    setDashboardLoading(false);
  }
}

export function initDashboard() {
  loadDashboardCache();
  refreshDashboard(getCurrentMonthName());
  selectedMonth = getCurrentMonthName();
  document
    .getElementById("dashboardRefreshFab")
    .addEventListener("click", () => {
      refreshDashboard(selectedMonth);
    });

  const dashboardMonth = document.getElementById("dashboardMonth");

  dashboardMonth.addEventListener("change", (event) => {
    const date = new Date(`${event.target.value}-01`);

    const monthName = date.toLocaleString("en-US", {
      month: "long",
    });

    if (selectedMonth === monthName) return;

    selectedMonth = monthName;

    loadDashboard(monthName);
  });
}

export const dashboard = {
  onEnter() {
    loadDashboard(selectedMonth);
  },
};
