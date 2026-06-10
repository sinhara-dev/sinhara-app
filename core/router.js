import { routes } from "./routes.js";
import { initDashboard } from "../modules/dashboard/dashboard.js";
import { initInventory } from "../modules/inventory/inventory.js";
import { initExpense } from "../modules/expense/expense.js";
import { initSales } from "../modules/sales/sales.js";

let activeTab = null;

export const switchTab = (tab) => {
  if (activeTab === tab) return;

  const route = routes[tab];
  if (!route) {
    return;
  }

  const tabs = document.querySelectorAll(".tab");

  // reset tab UI
  tabs.forEach((t) => t.classList.remove("active"));

  // hide all views
  Object.values(routes).forEach((r) => {
    const el = document.getElementById(r.viewId);
    if (el) el.style.display = "none";
  });

  // show selected view
  const view = document.getElementById(route.viewId);
  if (view) view.style.display = "block";

  // activate tab UI (based on index or data-tab)
  const tabIndex = Object.keys(routes).indexOf(tab);
  if (tabs[tabIndex]) tabs[tabIndex].classList.add("active");

  activeTab = tab;

  // lifecycle hook
  route.onEnter?.();
};

function initTabListeners() {
  document
    .getElementById("tab-dashboard")
    .addEventListener("click", () => switchTab("home"));

  document
    .getElementById("tab-inventory")
    .addEventListener("click", () => switchTab("inventory"));

  document
    .getElementById("tab-expenses")
    .addEventListener("click", () => switchTab("expense"));

  document
    .getElementById("tab-sales")
    .addEventListener("click", () => switchTab("sales"));
}

export function initRouter() {
  initTabListeners();

  initDashboard();
  initInventory();
  initExpense();
  initSales();

  switchTab("home");
}
