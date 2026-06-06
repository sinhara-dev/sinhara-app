import { checkAuth } from "./auth.js";
import { showLogin } from "../modules/login/login.js";
import { initMonthPicker } from "../shared/monthPicker.js";
import { initRouter } from "./router.js";

function showApp() {
  console.log("Showing app");
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
}

export async function startApplication() {
  const authenticated = await checkAuth();

  if (!authenticated) {
    showLogin();
    return;
  }

  showApp();
  initRouter();
  initMonthPicker();
}
