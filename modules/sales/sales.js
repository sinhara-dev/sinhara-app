import { http } from "../../services/http.js";
import { showStatus } from "../../utils/status.js";
import {
  formatDateMonthDay,
  getCurrentMonthName,
  getCurrentDate,
} from "../../utils/utils.js";

export const salesCache = {};
let selectedDate = getCurrentDate();

export function initSales() {
  const monthPicker = document.getElementById("salesMonthPicker");
  monthPicker.value = new Date().toISOString().slice(0, 7);

  monthPicker.addEventListener("change", () => {
    const date = new Date(`${monthPicker.value}-01`);
    if (selectedDate === date) return;

    const monthName = date.toLocaleString("en-US", {
      month: "long",
    });

    selectedDate = date;

    loadSalesData(date.getFullYear(), monthName);
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

  let totalSales = 0;
  let totalAfterCommission = 0;
  let totalSalesProfit = 0;

  rows.forEach((r) => {
    const total = Number(Number(r.amount) * Number(r.quantity));
    const afterCommission = Number(total * (1 - Number(r.commission)));
    const salesProfit = Number(
      afterCommission - Number(r.productExpense) * Number(r.quantity),
    );

    totalSales += total;
    totalAfterCommission += afterCommission;
    totalSalesProfit += salesProfit;

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
    originalAmountQty.textContent = `₹${Number(r.amount).toLocaleString("en-IN")} x ${r.quantity}`;

    const amount = document.createElement("div");
    amount.className = "sales-amount";
    amount.textContent = `₹${total.toLocaleString("en-IN")}`;

    const profit = document.createElement("div");
    profit.className = "sales-profit";
    profit.textContent = `₹${salesProfit.toLocaleString("en-IN")}`;

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

  updateSalesHeader(totalSales, totalAfterCommission, totalSalesProfit);
}

function updateSalesHeader(totalSales, totalAfterCommission, totalSalesProfit) {
  document.getElementById("salesTotal").innerText =
    "₹" + Number(totalSales).toLocaleString("en-IN");

  document.getElementById("salesCommission").innerText =
    "₹" + Number(totalAfterCommission).toLocaleString("en-IN");

  document.getElementById("salesProfit").innerText =
    "₹" + Number(totalSalesProfit).toLocaleString("en-IN");
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

function clearSalesHeaderAndList() {
  const container = document.getElementById("salesList");
  if (!container) return;
  container.innerHTML = "";

  document.getElementById("salesTotal").innerText = "₹--";
  document.getElementById("salesCommission").innerText = "₹--";
  document.getElementById("salesProfit").innerText = "₹--";
}

async function loadSalesData(year, month) {
  const cacheKey = `${year}-${month}`;
  if (salesCache[cacheKey]) {
    renderSalesList(salesCache[cacheKey].list);
    return;
  }

  showSalesLoading();

  try {
    const res = await http.Get("getSalesSummary", { year, month });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error);
    }

    renderSalesList(response.data.list);

    delete salesCache[cacheKey];
    salesCache[cacheKey] = response.data;
  } catch (error) {
    console.error(error);
    clearSalesHeaderAndList();

    showStatus(error.message, true);
  } finally {
    hideSalesLoading();
  }
}

export const sales = {
  onEnter: () => {
    loadSalesData(new Date().getFullYear(), getCurrentMonthName());
  },
};
