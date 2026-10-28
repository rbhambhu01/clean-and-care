// In production (GitHub Pages) there's no dev proxy, so point straight at the
// deployed backend via VITE_API_URL (set as a build-time env var / GH Actions secret).
// Locally, the relative "/api" path goes through the Vite dev server proxy.
const BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

export const api = {
  getCompany: () => request("/company"),
  getServices: () => request("/services"),
  getPricing: () => request("/pricing"),
  getTestimonials: () => request("/testimonials"),
  getBlog: () => request("/blog"),
  sendContact: (payload) => request("/contact", { method: "POST", body: JSON.stringify(payload) }),
  schedulePickup: (payload) => request("/schedule-pickup", { method: "POST", body: JSON.stringify(payload) }),
  adminLogin: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
};
