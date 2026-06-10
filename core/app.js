import { checkAuth, userLoggedIn } from "./auth.js";
import { showLogin } from "../modules/login/login.js";
import { initRouter } from "./router.js";

function showApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
}

function showAccessDenied() {
  document.getElementById("viewAccessDenied").style.display = "block";
  const signInText = document.getElementById("signInText");
  signInText.style.fontSize = "1rem";
  signInText.innerText = "Sign in with a different account";
}

function hideAccessDenied() {
  document.getElementById("viewAccessDenied").style.display = "none";
  const signInText = document.getElementById("signInText");
  signInText.style.fontSize = "1.3rem";
  signInText.innerText = "Sign in to continue";
}

function showLoader() {
  document.getElementById("loadingSpinner").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loadingSpinner").style.display = "none";
}

export async function startApplication() {
  showLoader();
  const authenticated = await checkAuth();
  hideLoader();
  if (!authenticated) {
    if (userLoggedIn()) {
      showAccessDenied();
    }
    showLogin();
    return;
  }

  hideAccessDenied();
  showApp();
  initRouter();
}
