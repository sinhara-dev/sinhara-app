export function formatAmount(amount) {
  return Number(amount).toLocaleString("en-IN");
}

export function getCurrentMonthName() {
  return new Date().toLocaleString("en-US", { month: "long" });
}
