import { checkAuth } from "../../core/auth.js";
import { initRouter } from "../../core/router.js";
import { initMonthPicker } from "../../shared/monthPicker.js";

let gisInitialized = false;

function showApp() {
  console.log("Showing app");
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "block";
}

function handleCredentialResponse(response) {
  console.log("handleCredentialResponse called");

  // store real session token
  localStorage.setItem("google_token", response.credential);

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
}

function initGoogle() {
  if (gisInitialized) return;
  gisInitialized = true;

  google.accounts.id.initialize({
    client_id:
      "382055113607-tsn501fgtlisnflhf7ldeg87mh8f32n5.apps.googleusercontent.com",
    callback: handleCredentialResponse,
    use_fedcm_for_prompt: true,
  });
}

function renderLoginUI() {
  google.accounts.id.renderButton(document.getElementById("googleButton"), {
    type: "standard",
    theme: "filled_blue",
    size: "large",
    shape: "pill",
  });
}

export async function showLogin() {
  console.log("Initializing google login");
  initGoogle();
  renderLoginUI();

  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("appScreen").style.display = "none";
}
