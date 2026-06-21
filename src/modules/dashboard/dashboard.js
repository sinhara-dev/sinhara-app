import * as utils from "../../utils/utils.js";
import * as app from "../../core/app.js";
import { http } from "../../services/http.js";

export const dashboardCache = {};
let selectedDate = utils.GetCurrentDate();

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

async function getDashboardDataFromServer(year, month) {
  const res = await http.Get("getDashboardData", {
    year,
    month,
  });

  if (res.status !== 200) {
    throw new Error(
      `Unable to fetch data, status: ${res.status}, statusText: ${res.statusText}`,
    );
  }

  return await res.json();
}

async function loadDashboard(year, month) {
  const cacheKey = `${year}-${month}`;
  if (dashboardCache[cacheKey]) {
    setDashboardValues(dashboardCache[cacheKey]);
    return;
  }

  setDashboardLoading(true);

  try {
    const response = await getDashboardDataFromServer(year, month);

    switch (response.code) {
      case 200: {
        setDashboardValues(response.data);
        setDashboardLoading(false);
        dashboardCache[cacheKey] = response.data;
        break;
      }

      case 401: {
        app.Logout();
        break;
      }

      default: {
        const error = new Error("System Error");
        error.response = response;
        throw error;
      }
    }
  } catch (error) {
    console.error(error);
    console.error({ ...error });
    utils.ShowStatus(error.message, true);
    clearDashboard();
  } finally {
    setDashboardLoading(false);
  }
}

async function refreshDashboard(year, month) {
  setDashboardLoading(true);

  const refreshButton = document.getElementById("dashboardRefreshButton");

  refreshButton.classList.add("dashboard-syncing");

  try {
    const response = await getDashboardDataFromServer(year, month);

    switch (response.code) {
      case 200: {
        setDashboardValues(response.data);

        utils.ShowStatus("Dashboard updated");

        const cacheKey = `${year}-${month}`;
        delete dashboardCache[cacheKey];
        dashboardCache[cacheKey] = response.data;
        break;
      }

      case 401: {
        app.Logout();
        break;
      }

      default: {
        const error = new Error("System Error");
        error.response = response;
        throw error;
      }
    }
  } catch (error) {
    console.error(error);
    console.error({ ...error });
    utils.ShowStatus(error.message, true);
    clearDashboard();
  } finally {
    refreshButton.classList.remove("dashboard-syncing");
    setDashboardLoading(false);
  }
}

export function initDashboard() {
  const month = utils.GetCurrentMonthName();
  const year = new Date().getFullYear();
  document
    .getElementById("dashboardRefreshButton")
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
