// Durable V1: Media assets repository

import type { MediaAsset } from "@/lib/domain/document";

interface MediaAssetRow {
  id: string;
  storage_key: string;
  public_url: string;
  filename: string;
  mime_type: string;
  size: number;
  alt: string;
  created_at: string;
}

function mediaAssetFromRow(row: MediaAssetRow): MediaAsset {
  return {
    id: row.id,
    storageKey: row.storage_key,
    publicUrl: row.public_url,
    filename: row.filename,
    mimeType: row.mime_type,
    size: row.size,
    alt: row.alt,
    createdAt: row.created_at,
  };
}

export async function getMediaAsset(
  db: D1Database,
  id: string
): Promise<MediaAsset | undefined> {
  const row = await db
    .prepare("SELECT * FROM media_assets WHERE id = ?")
    .bind(id)
    .first<MediaAssetRow>();

  return row ? mediaAssetFromRow(row) : undefined;
}

export async function listMediaAssets(
  db: D1Database,
  limit = 50,
  offset = 0
): Promise<{ assets: MediaAsset[]; total: number }> {
  const countResult = await db
    .prepare("SELECT COUNT(*) as total FROM media_assets")
    .first<{ total: number }>();

  const { results } = await db
    .prepare(
      "SELECT * FROM media_assets ORDER BY created_at DESC LIMIT ? OFFSET ?"
    )
    .bind(limit, offset)
    .all<MediaAssetRow>();

  return {
    assets: (results ?? []).map(mediaAssetFromRow),
    total: countResult?.total ?? 0,
  };
}

export async function getMediaAssetByStorageKey(
  db: D1Database,
  storageKey: string
): Promise<MediaAsset | undefined> {
  const row = await db
    .prepare("SELECT * FROM media_assets WHERE storage_key = ?")
    .bind(storageKey)
    .first<MediaAssetRow>();

  return row ? mediaAssetFromRow(row) : undefined;
}

export async function createMediaAsset(
  db: D1Database,
  asset: MediaAsset
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO media_assets (id, storage_key, public_url, filename, mime_type, size, alt, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      asset.id,
      asset.storageKey,
      asset.publicUrl,
      asset.filename,
      asset.mimeType,
      asset.size,
      asset.alt,
      asset.createdAt
    )
    .run();
}

export async function deleteMediaAsset(
  db: D1Database,
  id: string
): Promise<void> {
  await db
    .prepare("DELETE FROM media_assets WHERE id = ?")
    .bind(id)
    .run();
}
