import { checkAuth } from "./core/auth.js";
import { initRouter } from "./core/router.js";
import { showLogin } from "./modules/login/login.js";
import { initMonthPicker } from "./shared/monthPicker.js";

window.onload = function () {
  checkAuth()
    .then((authorized) => {
      if (authorized) {
        showApp();
        initRouter();
        initMonthPicker();
      } else {
        showLogin();
      }
    })
    .catch((e) => {
      console.error("Error during authentication check:", e);
      showLogin();
    });
};

function showApp() {
  console.log("Showing app");
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
}
