-- Durable V1: Add 'page' content type
-- Extends the CHECK constraints on categories, documents, and redirects
-- to accept 'page' alongside 'journal' and 'project'.
--
-- Strategy: D1/SQLite does not support ALTER COLUMN to modify CHECK constraints.
-- We recreate each affected table with the updated constraint, preserving data.
-- This is safe because the database is empty (Phase 4 cleaned all content).

-- Disable foreign keys for the migration transaction
PRAGMA foreign_keys = OFF;

BEGIN TRANSACTION;

-- ─── Categories ─────────────────────────────────────────────────────────────

CREATE TABLE categories_new (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('journal', 'project', 'page')),
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (content_type, slug)
);

INSERT INTO categories_new SELECT * FROM categories;
DROP TABLE categories;
ALTER TABLE categories_new RENAME TO categories;

CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_content_type_slug ON categories (content_type, slug);

-- ─── Documents ──────────────────────────────────────────────────────────────

CREATE TABLE documents_new (
  id TEXT PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('journal', 'project', 'page')),
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

INSERT INTO documents_new SELECT * FROM documents;
DROP TABLE documents;
ALTER TABLE documents_new RENAME TO documents;

CREATE UNIQUE INDEX IF NOT EXISTS idx_documents_content_type_slug ON documents (content_type, slug);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_scheduled_at ON documents (scheduled_at);

-- ─── Redirects ──────────────────────────────────────────────────────────────

CREATE TABLE redirects_new (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('journal', 'project', 'page')),
  old_slug TEXT NOT NULL,
  new_slug TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO redirects_new SELECT * FROM redirects;
DROP TABLE redirects;
ALTER TABLE redirects_new RENAME TO redirects;

CREATE UNIQUE INDEX IF NOT EXISTS idx_redirects_content_type_old_slug ON redirects (content_type, old_slug);
CREATE INDEX IF NOT EXISTS idx_redirects_document_id ON redirects (document_id);

-- ─── Document Revisions (unchanged — no content_type CHECK constraint) ──────

-- Revisions do not have a content_type column; no changes needed.

-- ─── Media Assets (unchanged — no content_type CHECK constraint) ────────────

-- Media assets do not have a content_type column; no changes needed.

COMMIT;

PRAGMA foreign_keys = ON;
