import { showStatus } from "../utils/status.js";
import { GAS_URL } from "../config.js";

const TOKEN_KEY = "google_token";

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export async function isAuthorized(email) {
  try {
    console.log("Validating stored token for user:", email);
    const res = await fetch(
      GAS_URL + "?action=validateUser&email=" + encodeURIComponent(email),
    );
    const response = await res.json();
    console.log("Validation response:", response);
    if (!response.success) {
      throw new Error(response.error || "Failed to validate user");
    }

    if (response.data) {
      return true;
    } else {
      throw new Error("Access denied");
    }
  } catch (e) {
    console.log("Error during token validation:", e.message);
    showStatus(e.message, true);
    return false;
  }
}

export function getUser() {
  const token = getToken();
  if (!token) return null;

  const payload = parseJwt(token);
  return payload?.email ? payload : null;
}

export function userLoggedIn() {
  return getUser() != null;
}

export async function checkAuth() {
  const user = getUser();
  if (!user) return false;

  return isAuthorized(user.email);
}
