ALTER TABLE tenants ADD COLUMN setup_completed INTEGER NOT NULL DEFAULT 1 CHECK (setup_completed IN (0, 1));
ALTER TABLE tenants ADD COLUMN country TEXT;
ALTER TABLE tenants ADD COLUMN city TEXT;
ALTER TABLE tenants ADD COLUMN physical_address TEXT;

-- Existing accounts keep their completed setup. New registrations are explicitly pending.
