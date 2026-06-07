export function formatAmount(amount) {
  return Number(amount).toLocaleString("en-IN");
}

export function getCurrentMonthName() {
  return new Date().toLocaleString("en-US", { month: "long" });
}

export function formatDateMonthDay(date) {
  const d = new Date(date);
  if (isNaN(d)) return "Invalid Date";
  const month = d.toLocaleDateString("en-US", {
    month: "long",
  });

  const day = String(d.getDate()).padStart(2, "0");

  return `${month} ${day}`;
}
