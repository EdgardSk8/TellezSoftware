ALTER TABLE products ADD COLUMN archived_at TEXT;

CREATE INDEX products_tenant_archive_created_idx
  ON products(tenant_id, archived_at, created_at DESC, id DESC);
