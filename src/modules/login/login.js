/* global google */

import * as app from "../../core/app.js";
import * as auth from "../../core/auth.js";
import { http } from "../../services/http.js";
import * as utils from "../../utils/utils.js";

let gisInitialized = false;
let gisRendered = false;

async function handleCredentialResponse(googleResponse) {
  console.error("received response from Google");
  try {
    utils.ShowLoader();

    console.error("calling login endpoint");
    const resp = await http.Post("login", {
      googleToken: googleResponse.credential,
    });

    if (resp.status !== 200) {
      throw new Error(
        `UNKNOWN ERROR, status: ${resp.status}, statusText: ${resp.statusText}`,
      );
    }

    const response = await resp.json();

    console.error(`login endpoint responded with code: ${response.code}`);

    switch (response.code) {
      case 200:
        auth.SetUserToken(response.data.token);
        await app.StartApplication();
        break;
      case 401:
        app.Logout();
        break;
      default:
        utils.ShowStatus("System Error", true);
        console.error(response.error);
        break;
    }
  } catch (error) {
    utils.ShowStatus(String(error), true);
    console.error(error);
  } finally {
    utils.HideLoader();
  }
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

export async function ShowLogin() {
  initGoogle();
  renderLoginUI();

  document.getElementById("appView").style.display = "none";
  document.getElementById("loginView").style.display = "flex";
}
