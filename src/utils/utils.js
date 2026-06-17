export function formatAmount(amount) {
  return Number(amount).toLocaleString("en-IN");
}

// Eg: 2026-06-13
export function getCurrentDate() {
  const date = new Date();

  const formatted =
    `${date.getFullYear()}-` +
    `${String(date.getMonth() + 1).padStart(2, "0")}-` +
    `${String(date.getDate()).padStart(2, "0")}`;

  return new Date(formatted);
}

// Eg: September
export function getCurrentMonthName() {
  return new Date().toLocaleString("en-US", { month: "long" });
}

// Eg: September
export function getMonthNameFromDate(date) {
  return new Date(date).toLocaleString("en-US", { month: "long" });
}

// 2026-06-01 => June 01
export function formatDateMonthDay(date) {
  const d = new Date(date);
  if (isNaN(d)) return "Invalid Date";
  const month = d.toLocaleDateString("en-US", {
    month: "long",
  });

  const day = String(d.getDate()).padStart(2, "0");

  return `${month} ${day}`;
}
