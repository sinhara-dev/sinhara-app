import { BASE_URL } from "../config.js";
import { GetUserToken } from "../core/auth.js";

const IS_DEV =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1" ||
  localStorage.getItem("app_env") === "dev";

class HttpClient {
  async Get(action, params = {}) {
    const url = new URL(BASE_URL);

    url.searchParams.set("action", action);
    if (IS_DEV) {
      url.searchParams.set("env", "dev");
    }

    console.info("GET ", url.searchParams.toString());

    url.searchParams.set("token", GetUserToken());

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    return fetch(url, {
      method: "GET",
    });
  }

  async Post(action, body = {}) {
    console.info(
      `POST action=${action} body=${JSON.stringify(body)} env=${IS_DEV ? "dev" : ""}`,
    );
    return fetch(BASE_URL, {
      method: "POST",
      body: JSON.stringify({
        action,
        env: IS_DEV ? "dev" : "",
        token: GetUserToken(),
        ...body,
      }),
    });
  }
}

export const http = new HttpClient();
