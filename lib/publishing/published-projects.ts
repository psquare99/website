// Re-exports D1-backed read functions for backward compatibility.
// Existing pages import from this module — they now get D1-backed behavior.

export { getPublishedProjects, getPublishedProject } from "./public-read";
