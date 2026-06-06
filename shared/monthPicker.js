let onApply = null;

export function initMonthPicker() {
  const applyBtn = document.getElementById("month-picker-apply-btn");
  const closeBtn = document.getElementById("month-picker-close-btn");

  applyBtn.addEventListener("click", applyMonth);
  closeBtn.addEventListener("click", closeMonthPicker);
}

export function openMonthPicker(callback) {
  console.log("Opening month picker");
  console.log("Callback provided:", !!callback);
  onApply = callback;
  document.getElementById("monthModal").style.display = "flex";
}

export function closeMonthPicker() {
  document.getElementById("monthModal").style.display = "none";
  // onApply = null;
}

function applyMonth() {
  console.log("Applying month selection");
  const month = document.getElementById("monthSelect").value;
  console.log("Selected month from dropdown:", month);

  closeMonthPicker();
  console.log("Invoking callback with month:", month);
  if (onApply) {
    console.log("Callback is available, invoking...");
    console.log(
      "ACTIVE TAB DOM CHECK:",
      document.getElementById("expensesView").style.display,
    );
    onApply(month);
  }

  onApply = null;
}
