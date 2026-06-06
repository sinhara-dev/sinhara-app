export function formatAmount(amount) {
  return Number(amount).toLocaleString("en-IN");
}

export function getCurrentMonthName() {
  return new Date().toLocaleString("en-US", { month: "long" });
}

export function formatDateMonthDay(date) {
  const month = date.toLocaleDateString("en-US", {
    month: "long",
  });

  const day = String(date.getDate()).padStart(2, "0");

  return `${month} ${day}`;
}
