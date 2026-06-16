import { showStatus } from "../../utils/status.js";
import {
  formatDateMonthDay,
  getCurrentDate,
  formatAmount,
  getCurrentMonthName,
} from "../../utils/utils.js";
import { openActionModal, closeActionModal } from "../../utils/modal.js";
import { http } from "../../services/http.js";

const expenseCache = {};
let selectedDate = getCurrentDate();

function showStatusMessage(message) {
  const statusDiv = document.getElementById("expense-status-message");

  if (!statusDiv) return;

  statusDiv.innerText = message;
}

function hideStatusMessage() {
  const statusDiv = document.getElementById("expense-status-message");

  if (!statusDiv) return;

  statusDiv.innerText = "";
}

async function submitExpense() {
  const date = document.getElementById("expenseDate").value;
  const item = document.getElementById("expenseItem").value.trim();
  const amount = Number(document.getElementById("expenseAmount").value);
  const type = document.getElementById("expenseType").value;
  const year = new Date(date).getFullYear();
  const month = new Date(date).toLocaleString("en-US", { month: "long" });

  if (!date) {
    showStatus("Please select a valid date");
    return;
  }

  if (!item) {
    showStatus("Please add valid item name");
    return;
  }

  if (!amount || amount <= 0) {
    showStatus("Please choose valid amount");
    return;
  }

  if (!type) {
    showStatus("Please choose availale type");
    return;
  }

  closeActionModal();

  showStatusMessage("Creating new expense...");

  try {
    const res = await http.Post("addExpense", {
      date,
      item,
      amount,
      type,
      year,
      month,
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to add expense");
    }

    // refresh current month view
    const cacheKey = `${year}-${month}`;
    delete expenseCache[cacheKey];
    loadExpenseHeader(year, month);

    showStatus("Expense added");
  } catch (error) {
    console.error(error);
    showStatus(error.message, true);
  } finally {
    hideStatusMessage();
  }
}

function openAddExpense() {
  const today = new Date().toISOString().split("T")[0];

  const container = document.createElement("div");

  // ---------- date ----------
  const dateLabel = document.createElement("label");
  dateLabel.textContent = "Date";

  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = today;
  dateInput.id = "expenseDate";

  // ---------- item ----------
  const itemLabel = document.createElement("label");
  itemLabel.textContent = "Item";

  const itemInput = document.createElement("input");
  itemInput.type = "text";
  itemInput.id = "expenseItem";

  // ---------- amount ----------
  const amountLabel = document.createElement("label");
  amountLabel.textContent = "Amount";

  const amountInput = document.createElement("input");
  amountInput.type = "number";
  amountInput.id = "expenseAmount";

  // ---------- type ----------
  const typeLabel = document.createElement("label");
  typeLabel.textContent = "Type";

  const typeSelect = document.createElement("select");
  typeSelect.id = "expenseType";

  const opt1 = document.createElement("option");
  opt1.value = "Product";
  opt1.textContent = "Product";

  const opt2 = document.createElement("option");
  opt2.value = "Operational";
  opt2.textContent = "Operational";

  typeSelect.appendChild(opt1);
  typeSelect.appendChild(opt2);

  // ---------- button ----------
  const btn = document.createElement("button");
  btn.style.marginTop = "1rem";
  btn.textContent = "SAVE";

  btn.addEventListener("click", submitExpense);

  // ---------- assemble ----------
  container.appendChild(dateLabel);
  container.appendChild(dateInput);

  container.appendChild(itemLabel);
  container.appendChild(itemInput);

  container.appendChild(amountLabel);
  container.appendChild(amountInput);

  container.appendChild(typeLabel);
  container.appendChild(typeSelect);

  container.appendChild(btn);

  openActionModal("Add Expense", container);
}

let initialized = false;

export function initExpense() {
  if (initialized) return;
  initialized = true;

  document
    .getElementById("expenseFab")
    .addEventListener("click", openAddExpense);

  const monthPicker = document.getElementById("expenseMonthPicker");

  monthPicker.value = new Date().toISOString().slice(0, 7);

  monthPicker.addEventListener("change", () => {
    const date = new Date(`${monthPicker.value}-01`);
    if (selectedDate === date) return;

    selectedDate = date;

    const monthName = date.toLocaleString("en-US", {
      month: "long",
    });

    loadExpenseHeader(date.getFullYear(), monthName);
  });

  document
    .getElementById("expenseRefreshButton")
    .addEventListener("click", () => {
      loadExpenseHeader(
        selectedDate.getFullYear(),
        selectedDate.toLocaleString("en-US", {
          month: "long",
        }),
      );
    });
}

function setExpenseLoading() {
  const ids = ["expenseTotal", "expenseProductCost", "expenseOperational"];

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.classList.add("skeleton");
    el.textContent = "██████";
  });

  const list = document.getElementById("expenseList");

  if (!list) return;

  list.innerHTML = `
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

function hideExpenseLoading() {
  document.getElementById("expenseTotal").classList.remove("skeleton");

  document.getElementById("expenseProductCost").classList.remove("skeleton");

  document.getElementById("expenseOperational").classList.remove("skeleton");
}

function clearExpenseHeaderAndList() {
  const container = document.getElementById("expenseList");
  if (!container) return;
  container.innerHTML = "";

  document.getElementById("expenseTotal").innerText = "₹--";
  document.getElementById("expenseProductCost").innerText = "₹--";
  document.getElementById("expenseOperational").innerText = "₹--";
}

function updateExpenseHeader(data) {
  if (!data) return;

  const totalEl = document.getElementById("expenseTotal");
  const productEl = document.getElementById("expenseProductCost");
  const opEl = document.getElementById("expenseOperational");

  if (!totalEl || !productEl || !opEl) {
    return;
  }

  totalEl.innerText = "₹" + Number(data.total || 0).toLocaleString("en-IN");

  productEl.innerText =
    "₹" + Number(data.productCost || 0).toLocaleString("en-IN");

  opEl.innerText =
    "₹" + Number(data.operationalExpense || 0).toLocaleString("en-IN");
}

function renderExpenseList(rows) {
  const container = document.getElementById("expenseList");

  container.innerHTML = "";

  rows.forEach((r) => {
    const date = new Date(r.date);

    const monthDay = formatDateMonthDay(date);

    const dayName = date.toLocaleDateString("en-US", {
      weekday: "long",
    });

    const card = document.createElement("div");
    card.className = "expense-card";

    card.innerHTML = `
      <div class="expense-row">

        <!-- Date -->
        <div class="col-expense-date">
          <div class="expense-date">
            ${monthDay}
          </div>
          <div class="expense-day">
            ${dayName}
          </div>
        </div>

        <!-- Main content -->
        <div class="expense-main">

          <div class="expense-item">
            ${r.item}
          </div>

          <div class="expense-bottom">
            <div class="expense-amount">
              ₹${formatAmount(r.amount)}
            </div>

            <div class="expense-type ${r.typeClass}">
              ${r.type}
            </div>
          </div>

        </div>

      </div>
    `;

    container.appendChild(card);
  });
}

async function loadExpenseHeader(year, month) {
  const cacheKey = `${year}-${month}`;
  if (expenseCache[cacheKey]) {
    updateExpenseHeader(expenseCache[cacheKey].summary);
    renderExpenseList(expenseCache[cacheKey].list);
    return;
  }

  setExpenseLoading();

  try {
    const res = await http.Get("getExpenseSummary", { year, month });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to load expense summary");
    }

    const data = response.data;

    hideExpenseLoading();

    updateExpenseHeader(data.summary);
    renderExpenseList(data.list);

    expenseCache[cacheKey] = data;
  } catch (error) {
    console.error(error);
    clearExpenseHeaderAndList();
    showStatus(error.message, true);
  } finally {
    hideExpenseLoading();
  }
}

export const expense = {
  onEnter: () => {
    loadExpenseHeader(new Date().getFullYear(), getCurrentMonthName);
  },
};
