import { getCurrentMonthName } from "../utils/utils.js";

let onApply = null;

export function initMonthPicker() {
  const applyBtn = document.getElementById("month-picker-apply-btn");
  const closeBtn = document.getElementById("month-picker-close-btn");

  applyBtn.addEventListener("click", applyMonth);
  closeBtn.addEventListener("click", closeMonthPicker);

  const currentMonth = getCurrentMonthName();

  const label = document.getElementById("selectedMonthLabel");
  const select = document.getElementById("monthSelect");

  if (label) label.innerText = currentMonth;
  if (select) select.value = currentMonth;
}

export function openMonthPicker(callback) {
  onApply = callback;
  document.getElementById("monthModal").style.display = "flex";
}

export function closeMonthPicker() {
  document.getElementById("monthModal").style.display = "none";
}

function applyMonth() {
  const month = document.getElementById("monthSelect").value;

  closeMonthPicker();
  if (onApply) {
    onApply(month);
  }

  onApply = null;
}
