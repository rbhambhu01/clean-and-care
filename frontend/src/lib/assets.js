// Resolves a path under /public/images against the current base URL, so
// images keep working whether the app is served from "/" (local dev) or
// "/clean-and-care/" (GitHub Pages project site).
export function img(path) {
  return `${import.meta.env.BASE_URL}images/${path}`;
}
