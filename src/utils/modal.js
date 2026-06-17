export function openActionModal(title, contentNode) {
  const titleEl = document.getElementById("actionModalTitle");
  const bodyEl = document.getElementById("actionModalBody");
  const modal = document.getElementById("actionModal");

  titleEl.textContent = title;

  bodyEl.innerHTML = ""; // clear previous content
  bodyEl.appendChild(contentNode); // 👈 key change

  modal.style.display = "flex";
}

export function closeActionModal() {
  document.getElementById("actionModal").style.display = "none";

  document.getElementById("actionModalBody").innerHTML = "";
}
