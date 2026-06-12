import { GAS_URL } from "../config.js";
import { getCurrentUser } from "../core/auth.js";

const IS_DEV =
  location.hostname === "localhost" || location.hostname === "127.0.0.1";

class HttpClient {
  async Get(action, params = {}) {
    const url = new URL(GAS_URL);

    url.searchParams.set("action", action);
    if (IS_DEV) {
      url.searchParams.set("env", "dev");
    }
    url.searchParams.set("user", getCurrentUser());

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    console.log("GET ", url.searchParams.toString());
    return fetch(url, {
      method: "GET",
    });
  }

  async Post(action, body = {}) {
    console.log("POST ", action);
    return fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({
        action,
        env: IS_DEV ? "dev" : "",
        user: getCurrentUser(),
        ...body,
      }),
    });
  }
}

export const http = new HttpClient();
