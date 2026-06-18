import { checkAuth, userLoggedIn } from "./auth.js";
import { showLogin } from "../modules/login/login.js";
import { initRouter } from "./router.js";

function showApp() {
  document.getElementById("loginView").style.display = "none";
  document.getElementById("appView").style.display = "block";
}

function showAccessDenied() {
  document.getElementById("viewAccessDenied").style.display = "block";
  const signInText = document.getElementById("signInText");
  signInText.style.fontSize = "1rem";
  signInText.innerText = "Sign in with a different account";
}

// function hideAccessDenied() {
//   document.getElementById("viewAccessDenied").style.display = "none";
//   const signInText = document.getElementById("signInText");
//   signInText.style.fontSize = "1.3rem";
//   signInText.innerText = "Sign in to continue";
// }

function showLoader() {
  document.getElementById("loadingSpinner").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loadingSpinner").style.display = "none";
}

async function loadView(viewName) {
  const response = await fetch(`src/modules/${viewName}/${viewName}.html`);
  const html = await response.text();

  document.getElementById(`${viewName}View`).innerHTML = html;
}

async function loadPages() {
  await Promise.all([
    loadView("dashboard"),
    loadView("inventory"),
    loadView("sales"),
    loadView("expense"),
  ]);
}

export async function startApplication() {
  showLoader();
  const authenticated = await checkAuth();

  if (!authenticated) {
    await loadView("login");
    hideLoader();
    if (userLoggedIn()) {
      showAccessDenied();
    }
    showLogin();
    return;
  }

  await loadPages();
  hideLoader();
  showApp();
  initRouter();
}
