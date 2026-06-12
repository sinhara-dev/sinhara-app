import { showStatus } from "../utils/status.js";
import { http } from "../services/http.js";

const TOKEN_KEY = "google_token";

let currentUser = "UNKNOWN";

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

async function isAuthorized(email) {
  try {
    const res = await http.Get("validateUser", {
      email,
    });
    const response = await res.json();
    if (!response.success) {
      throw new Error(response.error || "Failed to validate user");
    }

    if (response.data) {
      currentUser = email;
      return true;
    } else {
      throw new Error("Access denied");
    }
  } catch (e) {
    showStatus(e.message, true);
    return false;
  }
}

export function getCurrentUser() {
  return currentUser;
}

function getUser() {
  const token = getToken();
  if (!token) return null;

  const payload = parseJwt(token);
  return payload?.email ? payload : null;
}

export function userLoggedIn() {
  return getUser() != null;
}

export async function checkAuth() {
  // return true;
  const user = getUser();
  if (!user) return false;

  return isAuthorized(user.email);
}
