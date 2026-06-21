export function FormatAmount(amount) {
  return Number(amount).toLocaleString("en-IN");
}

// Eg: 2026-06-13
export function GetCurrentDate() {
  const date = new Date();

  const formatted =
    `${date.getFullYear()}-` +
    `${String(date.getMonth() + 1).padStart(2, "0")}-` +
    `${String(date.getDate()).padStart(2, "0")}`;

  return new Date(formatted);
}

// Eg: September
export function GetCurrentMonthName() {
  return new Date().toLocaleString("en-US", { month: "long" });
}

// Eg: September
export function GetMonthNameFromDate(date) {
  return new Date(date).toLocaleString("en-US", { month: "long" });
}

// 2026-06-01 => June 01
export function FormatDateMonthDay(date) {
  const d = new Date(date);
  if (isNaN(d)) return "Invalid Date";
  const month = d.toLocaleDateString("en-US", {
    month: "long",
  });

  const day = String(d.getDate()).padStart(2, "0");

  return `${month} ${day}`;
}

export function ShowStatus(message, isError = false) {
  const status = document.getElementById("statusMessage");

  status.innerText = message;

  status.style.background = isError ? "#ffebee" : "#e8f5e9";

  status.style.color = isError ? "#c62828" : "#2e7d32";

  status.style.display = "block";

  setTimeout(() => {
    status.style.display = "none";
  }, 3000);
}

export function ShowLoader() {
  document.getElementById("loadingSpinner").style.display = "flex";
}

export function HideLoader() {
  document.getElementById("loadingSpinner").style.display = "none";
}
