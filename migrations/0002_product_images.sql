CREATE TABLE product_images (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type = 'image/webp'),
  size_bytes INTEGER NOT NULL CHECK (size_bytes BETWEEN 1 AND 153600),
  width INTEGER NOT NULL CHECK (width BETWEEN 1 AND 2000),
  height INTEGER NOT NULL CHECK (height BETWEEN 1 AND 2000),
  position INTEGER NOT NULL CHECK (position BETWEEN 0 AND 4),
  created_at TEXT NOT NULL,
  UNIQUE (tenant_id, product_id, position),
  FOREIGN KEY (tenant_id, product_id)
    REFERENCES products(tenant_id, id) ON DELETE CASCADE
);

CREATE INDEX product_images_tenant_product_idx
  ON product_images(tenant_id, product_id, position);
