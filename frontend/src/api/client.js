import axios from "axios";

const TOKEN_KEY = "shopnest_token";
const USER_KEY = "shopnest_user";

function read(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key, value) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage can be blocked (private window): the session then lasts until the page closes */
  }
}

export const session = {
  token: () => read(TOKEN_KEY),
  user: () => {
    try {
      return JSON.parse(read(USER_KEY) || "null");
    } catch {
      return null;
    }
  },
  save(token, user) {
    write(TOKEN_KEY, token);
    write(USER_KEY, JSON.stringify(user));
  },
  saveUser(user) {
    write(USER_KEY, JSON.stringify(user));
  },
  clear() {
    write(TOKEN_KEY, null);
    write(USER_KEY, null);
  },
};

let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || "/api" });

api.interceptors.request.use((config) => {
  const token = session.token();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A 401 while a token is stored means the token expired or was rejected: end the session.
    if (error.response?.status === 401 && session.token() && onUnauthorized) onUnauthorized();
    return Promise.reject(error);
  }
);

/** Turns any failed request into { status, message, fieldErrors } for the UI. */
export function apiError(error) {
  if (error?.response) {
    const data = error.response.data || {};
    return {
      status: error.response.status,
      message: data.message || "Something went wrong. Please try again.",
      fieldErrors: data.errors || {},
    };
  }
  return {
    status: 0,
    message: "Can't reach the store server. Check your connection and try again.",
    fieldErrors: {},
  };
}

export default api;
