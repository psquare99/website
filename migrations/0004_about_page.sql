-- Migration 0004: About page singleton content table
-- Stores the structured About/Waypoint content as a single JSON row.

CREATE TABLE IF NOT EXISTS about_page (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
