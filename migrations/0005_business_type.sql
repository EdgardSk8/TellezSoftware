ALTER TABLE tenants ADD COLUMN business_type TEXT CHECK (
  business_type IS NULL OR business_type IN (
    'clothing',
    'hardware',
    'electronics',
    'auto_parts',
    'food',
    'liquor',
    'general',
    'personal'
  )
);
