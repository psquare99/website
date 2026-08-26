-- Durable V1: Initial schema (includes Phase 0.5 corrections)
-- Creates: documents, categories, media_assets, document_revisions, redirects

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('journal', 'project')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (content_type, slug)
);

-- Documents
--
-- Status lifecycle:
--   draft → published → modified → published  (edit cycle)
--   draft → scheduled → published             (scheduled publish)
--   published → unpublished                   (manual unpublish)
--   modified → unpublished                    (manual unpublish)
--
-- scheduled_at CHECK constraint enforces:
--   status = 'scheduled'  ⟺  scheduled_at IS NOT NULL
-- This prevents drift between the enum and the timestamp at the DB level.
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('journal', 'project')),
  slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'modified', 'scheduled', 'unpublished')),
  title TEXT NOT NULL DEFAULT '',
  metadata TEXT NOT NULL DEFAULT '{}',
  blocks TEXT NOT NULL DEFAULT '[]',
  published_at TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  published_slug TEXT,
  scheduled_at TEXT,
  category_id TEXT REFERENCES categories(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (
    (status = 'scheduled' AND scheduled_at IS NOT NULL)
    OR (status != 'scheduled' AND scheduled_at IS NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_content_type_slug ON documents (content_type, slug);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_scheduled_at ON documents (scheduled_at);

-- Document Revisions (full snapshots)
--
-- Revisions are append-only. The "current published revision" is always:
--   SELECT * FROM document_revisions
--   WHERE document_id = ? AND label = 'published'
--   ORDER BY created_at DESC
--   LIMIT 1
--
-- The composite index (document_id, label, created_at) supports this
-- query with a single index seek + reverse scan.
CREATE TABLE IF NOT EXISTS document_revisions (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  metadata TEXT NOT NULL DEFAULT '{}',
  blocks TEXT NOT NULL DEFAULT '[]',
  label TEXT NOT NULL CHECK (label IN ('draft', 'published', 'backup')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_revisions_document_id_label_created
  ON document_revisions (document_id, label, created_at);

-- Redirects (slug history)
CREATE TABLE IF NOT EXISTS redirects (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('journal', 'project')),
  old_slug TEXT NOT NULL,
  new_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_redirects_content_type_old_slug ON redirects (content_type, old_slug);
CREATE INDEX IF NOT EXISTS idx_redirects_document_id ON redirects (document_id);

-- Media Assets
CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  storage_key TEXT NOT NULL,
  public_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_media_assets_storage_key ON media_assets (storage_key);
