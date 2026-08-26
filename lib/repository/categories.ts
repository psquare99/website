// Durable V1: Categories repository

import type { Category, ContentType } from "@/lib/domain/document";

interface CategoryRow {
  id: string;
  content_type: string;
  name: string;
  slug: string;
  created_at: string;
}

function categoryFromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    contentType: row.content_type as ContentType,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
  };
}

export async function getCategory(
  db: D1Database,
  id: string
): Promise<Category | undefined> {
  const row = await db
    .prepare("SELECT * FROM categories WHERE id = ?")
    .bind(id)
    .first<CategoryRow>();

  return row ? categoryFromRow(row) : undefined;
}

export async function getCategories(
  db: D1Database,
  contentType: ContentType
): Promise<Category[]> {
  const { results } = await db
    .prepare("SELECT * FROM categories WHERE content_type = ? ORDER BY name")
    .bind(contentType)
    .all<CategoryRow>();

  return (results ?? []).map(categoryFromRow);
}

export async function createCategory(
  db: D1Database,
  category: Category
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO categories (id, content_type, name, slug, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      category.id,
      category.contentType,
      category.name,
      category.slug,
      category.createdAt
    )
    .run();
}

export async function deleteCategory(
  db: D1Database,
  id: string
): Promise<void> {
  await db
    .prepare("DELETE FROM categories WHERE id = ?")
    .bind(id)
    .run();
}
