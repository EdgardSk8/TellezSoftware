ALTER TABLE tenants ADD COLUMN phone_country_code TEXT;
ALTER TABLE tenants ADD COLUMN phone_number TEXT;
ALTER TABLE tenants ADD COLUMN trial_started_at TEXT;
ALTER TABLE tenants ADD COLUMN plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'paid'));

UPDATE tenants SET trial_started_at = CURRENT_TIMESTAMP WHERE trial_started_at IS NULL;
