export function showStatus(message, isError = false) {
  const status = document.getElementById("statusMessage");

  status.innerText = message;

  status.style.background = isError ? "#ffebee" : "#e8f5e9";

  status.style.color = isError ? "#c62828" : "#2e7d32";

  status.style.display = "block";

  setTimeout(() => {
    status.style.display = "none";
  }, 3000);
}
