-- Cuentas externas vinculadas (Google) para el inicio de sesión federado.
CREATE TABLE oauth_accounts (
  provider TEXT NOT NULL,
  provider_uid TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (provider, provider_uid)
);

CREATE INDEX oauth_accounts_user_idx ON oauth_accounts(user_id);
