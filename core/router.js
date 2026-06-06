let activeTab = null;

function switchTab(tab) {
  console.log("Switching to tab:", tab);
  if (activeTab === tab) return;

  const route = routes[tab];
  if (!route) return;

  const tabs = document.querySelectorAll(".tab");

  // reset tab UI
  tabs.forEach((t) => t.classList.remove("active"));

  // hide all views
  Object.values(routes).forEach((r) => {
    const el = document.getElementById(r.viewId);
    if (el) el.style.display = "none";
  });

  // show selected view
  const view = document.getElementById(route.viewId);
  if (view) view.style.display = "block";

  // activate tab UI (based on index or data-tab)
  const tabIndex = Object.keys(routes).indexOf(tab);
  if (tabs[tabIndex]) tabs[tabIndex].classList.add("active");

  activeTab = tab;

  // lifecycle hook
  route.onEnter?.();
}
