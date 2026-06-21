const TOKEN_KEY = "jwt_auth_token";

let currentUserToken = null;

export function SetUserToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function RemoveUserToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function GetUserToken() {
  if (currentUserToken) return currentUserToken;
  currentUserToken = localStorage.getItem(TOKEN_KEY);
  return currentUserToken;
}

export function UserLoggedIn() {
  return GetUserToken() != null;
}
