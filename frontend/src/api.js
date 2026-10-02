const JSON_HEADERS = { "Content-Type": "application/json" };

async function request(path, options = {}) {
  const response = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      ...(options.body ? JSON_HEADERS : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail.map((item) => item.msg || JSON.stringify(item)).join(" ")
          : "Request failed";
    throw new Error(message);
  }
  return data;
}

export const api = {
  me: () => request("/api/auth/me"),
  register: (body) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/api/auth/logout", { method: "POST" }),
  sendCode: (email, purpose) =>
    request("/api/auth/send-code", {
      method: "POST",
      body: JSON.stringify({ email, purpose }),
    }),
  resetPassword: (body) =>
    request("/api/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
  getDashboard: () => request("/api/dashboard/portfolio"),
  savePortfolio: (portfolio) =>
    request("/api/dashboard/portfolio", {
      method: "PUT",
      body: JSON.stringify({ portfolio }),
    }),
  saveSettings: (body) =>
    request("/api/dashboard/settings", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  getMessages: () => request("/api/dashboard/messages"),
  adminUsers: () => request("/api/admin/users"),
  getSite: (slug) => request(`/api/sites/${encodeURIComponent(slug)}`),
  contact: (slug, body) =>
    request(`/api/sites/${encodeURIComponent(slug)}/contact`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
