PRAGMA foreign_keys = ON;

CREATE TABLE tenants (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 2 AND 100),
  slug TEXT NOT NULL UNIQUE,
  inventory_profile TEXT NOT NULL CHECK (
    inventory_profile IN ('clothing', 'hardware', 'solid_goods', 'personal')
  ),
  currency TEXT NOT NULL DEFAULT 'NIO' CHECK (length(currency) = 3),
  created_at TEXT NOT NULL
);

CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
  created_at TEXT NOT NULL
);

CREATE TABLE tenant_memberships (
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'staff', 'viewer')),
  created_at TEXT NOT NULL,
  PRIMARY KEY (tenant_id, user_id)
);

CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id, user_id)
    REFERENCES tenant_memberships(tenant_id, user_id) ON DELETE CASCADE
);

CREATE TABLE login_attempts (
  identity_hash TEXT NOT NULL,
  attempted_at TEXT NOT NULL
);

CREATE TABLE products (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 160),
  sku TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General',
  inventory_profile TEXT NOT NULL CHECK (
    inventory_profile IN ('clothing', 'hardware', 'solid_goods', 'personal')
  ),
  quantity REAL NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  min_stock REAL NOT NULL DEFAULT 0 CHECK (min_stock >= 0),
  unit TEXT NOT NULL DEFAULT 'unit',
  cost REAL NOT NULL DEFAULT 0 CHECK (cost >= 0),
  price REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
  variant TEXT,
  serial_tracking TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (tenant_id, id),
  UNIQUE (tenant_id, sku)
);

CREATE TABLE stock_movements (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id),
  quantity_change REAL NOT NULL,
  quantity_before REAL NOT NULL CHECK (quantity_before >= 0),
  quantity_after REAL NOT NULL CHECK (quantity_after >= 0),
  reason TEXT NOT NULL CHECK (length(reason) BETWEEN 1 AND 300),
  created_at TEXT NOT NULL,
  FOREIGN KEY (tenant_id, product_id)
    REFERENCES products(tenant_id, id) ON DELETE CASCADE
);

CREATE INDEX tenant_memberships_user_idx ON tenant_memberships(user_id, tenant_id);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);
CREATE INDEX login_attempts_identity_time_idx ON login_attempts(identity_hash, attempted_at);
CREATE INDEX products_tenant_created_idx ON products(tenant_id, created_at DESC, id DESC);
CREATE INDEX products_tenant_name_idx ON products(tenant_id, name);
CREATE INDEX stock_movements_tenant_created_idx ON stock_movements(tenant_id, created_at DESC);
CREATE INDEX stock_movements_product_idx ON stock_movements(tenant_id, product_id, created_at DESC);
