/* global google */

import { startApplication } from "../../core/app.js";

let gisInitialized = false;
let gisRendered = false;

function handleCredentialResponse(response) {
  localStorage.setItem("google_token", response.credential);

  startApplication();
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
  if (gisRendered) return;
  gisRendered = true;

  google.accounts.id.renderButton(document.getElementById("googleButton"), {
    type: "standard",
    theme: "filled_blue",
    size: "large",
    shape: "pill",
  });
}

export async function showLogin() {
  initGoogle();
  renderLoginUI();

  document.getElementById("appView").style.display = "none";
  document.getElementById("loginView").style.display = "flex";
}
