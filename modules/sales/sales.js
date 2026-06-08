import { GAS_URL } from "../../config.js";
import { showStatus } from "../../utils/status.js";
import { formatDateMonthDay, getCurrentMonthName } from "../../utils/utils.js";
import { openMonthPicker } from "../../shared/monthPicker.js";

export const salesCache = {};

export function initSales() {
  document
    .getElementById("month-picker-open-btn-sales")
    .addEventListener("click", () => {
      openMonthPicker((month) => {
        document.getElementById("selectedMonthLabelSales").innerText = month;
        loadSalesData(month);
      });
    });
}

function showImagePreview(imageUrl) {
  document.getElementById("imagePreview").src = imageUrl;

  document.getElementById("imagePreviewOverlay").style.display = "flex";
}

function renderSalesList(rows) {
  const container = document.getElementById("salesList");

  if (!container) return;

  container.innerHTML = "";

  rows.forEach((r) => {
    const card = document.createElement("div");
    card.className = "sales-card";

    const topRow = document.createElement("div");
    topRow.className = "product-top-row";

    // ---------- column 1 (image) ----------
    const colImg = document.createElement("div");
    colImg.className = "col-img";

    const img = document.createElement("img");
    img.src = r.thumbnailUrl;

    img.addEventListener("click", () => {
      showImagePreview(r.thumbnailUrl);
    });

    colImg.appendChild(img);

    // ---------- column 2 (amount + quantity + sold amount + profit) ----------
    const col1 = document.createElement("div");
    col1.className = "col-info";

    const originalAmountQty = document.createElement("div");
    originalAmountQty.className = "sales-original-amount";
    originalAmountQty.textContent = `${r.amount} x ${r.quantity}`;

    const amount = document.createElement("div");
    amount.className = "sales-amount";
    amount.textContent = `₹${Number(r.total).toLocaleString("en-IN")}`;

    const profit = document.createElement("div");
    profit.className = "sales-profit";
    profit.textContent = `₹${Number(r.profit).toLocaleString("en-IN")}`;

    col1.appendChild(originalAmountQty);
    col1.appendChild(amount);
    col1.appendChild(profit);

    // ---------- column 3 (date + soldBy) ----------
    const col2 = document.createElement("div");
    col2.className = "col-info";

    const date = document.createElement("div");
    date.className = "sales-date";
    date.textContent = formatDateMonthDay(r.date);

    const expense = document.createElement("div");
    expense.className = "sales-date";
    expense.textContent = `₹${Number(r.productExpense).toLocaleString("en-IN")}`;

    const team = document.createElement("div");
    const teamClass = r.soldBy.toLowerCase().replace(/\s+/g, "-");
    team.className = `sales-team ${teamClass}`;
    team.textContent = r.soldBy;

    col2.appendChild(date);
    col2.appendChild(expense);
    col2.appendChild(team);

    // ---------- product name ----------
    const name = document.createElement("div");
    name.className = "product-name";
    name.textContent = r.name;

    // ---------- assemble ----------
    topRow.appendChild(colImg);
    topRow.appendChild(col1);
    topRow.appendChild(col2);

    card.appendChild(topRow);
    card.appendChild(name);

    container.appendChild(card);
  });
}

function updateSalesHeader(data) {
  document.getElementById("salesTotal").innerText =
    "₹" + Number(data.totalSales).toLocaleString("en-IN");

  document.getElementById("salesCommission").innerText =
    "₹" + Number(data.totalCommission).toLocaleString("en-IN");

  document.getElementById("salesProfit").innerText =
    "₹" + Number(data.totalProfit).toLocaleString("en-IN");
}

function showSalesLoading() {
  document.getElementById("salesTotal").classList.add("skeleton");
  document.getElementById("salesCommission").classList.add("skeleton");
  document.getElementById("salesProfit").classList.add("skeleton");

  document.getElementById("salesTotal").innerText = "██████";
  document.getElementById("salesCommission").innerText = "██████";
  document.getElementById("salesProfit").innerText = "██████";

  document.getElementById("salesList").innerHTML = `
      <div class="expense-skeleton">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
      <div class="expense-skeleton">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
      <div class="expense-skeleton">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
  `;
}

function hideSalesLoading() {
  document.getElementById("salesTotal").classList.remove("skeleton");

  document.getElementById("salesCommission").classList.remove("skeleton");

  document.getElementById("salesProfit").classList.remove("skeleton");
}

async function loadSalesData(month) {
  if (salesCache[month]) {
    updateSalesHeader(salesCache[month].summary);

    renderSalesList(salesCache[month].list);

    return;
  }

  showSalesLoading();

  try {
    const res = await fetch(
      `${GAS_URL}?action=getSalesSummary&month=${encodeURIComponent(month)}`,
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error);
    }

    updateSalesHeader(response.data.summary);
    renderSalesList(response.data.list);

    salesCache[month] = response.data;
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    hideSalesLoading();
  }
}

export const sales = {
  onEnter: () => {
    loadSalesData(getCurrentMonthName());
  },
};
