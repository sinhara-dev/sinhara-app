import { GAS_URL } from "../../config.js";
import { showStatus } from "../../utils/status.js";
import { getCurrentMonthName } from "../../utils/utils.js";
import { formatAmount } from "../../utils/utils.js";
import { openActionModal, closeActionModal } from "../../utils/modal.js";
import { openMonthPicker } from "../../shared/monthPicker.js";

const expenseCache = {};

function showLoader() {
  document.getElementById("loadingSpinner").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loadingSpinner").style.display = "none";
}

async function submitExpense() {
  const date = document.getElementById("expenseDate").value;
  const item = document.getElementById("expenseItem").value.trim();
  const amount = Number(document.getElementById("expenseAmount").value);
  const type = document.getElementById("expenseType").value;

  const month = new Date(date).toLocaleString("en-US", { month: "long" });

  if (!date || !item || !amount || amount <= 0 || !type) {
    showStatus("Fill all fields properly", true);
    return;
  }

  closeActionModal();

  showLoader?.();

  try {
    const res = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "addExpense",
        date,
        item,
        amount,
        type,
        month,
      }),
    });

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to add expense");
    }

    // refresh current month view
    delete expenseCache[month];
    loadExpenseHeader(month);

    showStatus("Expense added");
  } catch (err) {
    showStatus(err.message, true);
  } finally {
    hideLoader?.();
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

  document
    .getElementById("month-picker-open-btn-expense")
    .addEventListener("click", () => {
      openMonthPicker((month) => {
        console.log("Selected month (callback):", month);
        document.getElementById("selectedMonthLabel").innerText = month;
        loadExpenseHeader(month);
      });
    });
}

function setExpenseLoading(isLoading) {
  const ids = ["expenseTotal", "expenseProductCost", "expenseOperational"];

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

  const list = document.getElementById("expenseList");

  if (!list) return;

  if (isLoading) {
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
}

function updateExpenseHeader(data) {
  if (!data) return;

  const totalEl = document.getElementById("expenseTotal");
  const productEl = document.getElementById("expenseProductCost");
  const opEl = document.getElementById("expenseOperational");

  if (!totalEl || !productEl || !opEl) {
    console.error("Expense header DOM missing");
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
    const card = document.createElement("div");
    card.className = "expense-card";

    card.innerHTML = `
      <div class="expense-row">

        <!-- Date -->
        <div class="expense-date">
          ${r.date}
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

// function renderExpenseList(rows) {
//   const container = document.getElementById("expenseList");

//   if (!container) return;

//   container.innerHTML = "";

//   rows.forEach((r) => {
//     const card = document.createElement("div");
//     card.className = "expense-card";

//     const row = document.createElement("div");
//     row.className = "expense-row";

//     // ---------- date ----------
//     const dateEl = document.createElement("div");
//     dateEl.className = "expense-date";
//     dateEl.textContent = r.date;

//     // ---------- main ----------
//     const main = document.createElement("div");
//     main.className = "expense-main";

//     // item
//     const item = document.createElement("div");
//     item.className = "expense-item";
//     item.textContent = r.item;

//     // bottom section
//     const bottom = document.createElement("div");
//     bottom.className = "expense-bottom";

//     // amount
//     const amount = document.createElement("div");
//     amount.className = "expense-amount";
//     amount.textContent = `₹${formatAmount(r.amount)}`;

//     // type
//     const type = document.createElement("div");
//     type.className = `expense-type ${r.typeClass}`;
//     type.textContent = r.type;

//     bottom.appendChild(amount);
//     bottom.appendChild(type);

//     // assemble main
//     main.appendChild(item);
//     main.appendChild(bottom);

//     // assemble row
//     row.appendChild(dateEl);
//     row.appendChild(main);

//     // assemble card
//     card.appendChild(row);

//     container.appendChild(card);
//   });
// }

async function loadExpenseHeader(month) {
  setExpenseLoading(true);

  if (expenseCache[month]) {
    updateExpenseHeader(expenseCache[month].summary);
    renderExpenseList(expenseCache[month].list);
    setExpenseLoading(false);
    return;
  }

  try {
    const res = await fetch(
      GAS_URL +
        "?action=getExpenseSummary" +
        "&month=" +
        encodeURIComponent(month),
    );

    const response = await res.json();

    if (!response.success) {
      throw new Error(response.error || "Failed to load expense summary");
    }

    const data = response.data;

    setExpenseLoading(false);

    updateExpenseHeader(data.summary);
    renderExpenseList(data.list);

    expenseCache[month] = data;
  } catch (err) {
    setExpenseLoading(false);

    showStatus(err.message, true);
  }
}

export const expense = {
  onEnter: () => {
    initExpense();
    loadExpenseHeader(getCurrentMonthName());
  },
};
