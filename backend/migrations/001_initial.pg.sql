-- PostgreSQL initial schema. Application timestamps and JSON remain TEXT for API compatibility.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin','manager','support','editor','owner')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','suspended')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_resets (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  price_cents BIGINT,
  currency TEXT,
  category_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  thumbnail TEXT,
  featured INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  license_reference TEXT,
  refund_reference TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS product_files (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT,
  size_bytes BIGINT,
  version TEXT,
  storage_key TEXT,
  status TEXT NOT NULL DEFAULT 'unavailable' CHECK (status IN ('unavailable','available','archived')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  detailed_description TEXT,
  visual TEXT,
  deliverables TEXT,
  cta TEXT,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  file_name TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image','video','document','other')),
  storage_key TEXT,
  dimensions TEXT,
  size_bytes BIGINT,
  usage_reference TEXT,
  visibility TEXT NOT NULL DEFAULT 'private' CHECK (visibility IN ('public','private')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','available','archived')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documentation_entries (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT,
  content TEXT,
  category TEXT,
  display_order INTEGER,
  seo_title TEXT,
  seo_description TEXT,
  attachment_media_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (attachment_media_id) REFERENCES media(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  featured_media_id TEXT,
  category TEXT,
  author_user_id TEXT,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','scheduled','archived')),
  published_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (featured_media_id) REFERENCES media(id) ON DELETE SET NULL,
  FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  reference TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  subtotal_cents BIGINT,
  discount_cents BIGINT NOT NULL DEFAULT 0,
  total_cents BIGINT,
  currency TEXT,
  payment_reference TEXT,
  checkout_idempotency_key TEXT UNIQUE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending','paid','processing','completed','cancelled','refunded')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_title_snapshot TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price_cents BIGINT,
  line_subtotal_cents BIGINT,
  currency TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS downloads (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  order_id TEXT,
  product_id TEXT NOT NULL,
  version TEXT,
  storage_key TEXT,
  availability TEXT NOT NULL DEFAULT 'unavailable' CHECK (availability IN ('available','unavailable','revoked')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  order_id TEXT,
  product_id TEXT NOT NULL,
  license_type TEXT,
  key_hash TEXT,
  key_ciphertext TEXT,
  key_version TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','revoked','expired')),
  issued_at TEXT,
  expires_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS saved_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  UNIQUE(user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS billing_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  order_id TEXT,
  provider_reference TEXT,
  amount_cents BIGINT,
  currency TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','refunded')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  order_id TEXT,
  payload_hash TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','verified','failed','ignored')),
  created_at TEXT NOT NULL,
  UNIQUE(provider, provider_event_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS download_events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  download_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (download_id) REFERENCES downloads(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','pending','resolved','closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  assignee_user_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  author_user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  internal_note INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
  FOREIGN KEY (author_user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender_user_id TEXT NOT NULL,
  recipient_user_id TEXT NOT NULL,
  body TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  destination TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  rating INTEGER,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','hidden')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage','fixed_amount')),
  discount_value BIGINT NOT NULL,
  start_at TEXT,
  end_at TEXT,
  usage_limit BIGINT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','expired','disabled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('owner','admin','manager','support','editor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  last_activity_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  target TEXT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success','failed')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS crm_contacts (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  tags TEXT,
  status TEXT,
  created_at TEXT NOT NULL,
  last_activity_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS forms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  definition_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS form_submissions (
  id TEXT PRIMARY KEY,
  form_id TEXT NOT NULL,
  payload_json TEXT,
  status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received','processed','failed')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','subscribed','unsubscribed')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workflows (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','completed','error')),
  definition_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT,
  preview_text TEXT,
  audience TEXT,
  content TEXT,
  schedule_at TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','scheduled','sending','sent','paused','cancelled')),
  created_at TEXT NOT NULL,
  sent_at TEXT
);

CREATE TABLE IF NOT EXISTS integration_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_user_id TEXT,
  payload_json TEXT,
  idempotency_key TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'recorded' CHECK (status IN ('recorded','queued','completed','failed','ignored')),
  created_at TEXT NOT NULL,
  FOREIGN KEY (actor_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS workflow_executions (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  event_id TEXT,
  execution_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','completed','failed','blocked','cancelled')),
  error_summary TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES integration_events(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS provider_usage_logs (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  operation TEXT NOT NULL,
  status TEXT NOT NULL,
  safe_summary TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,
  product_id TEXT,
  order_id TEXT,
  payload_json TEXT,
  idempotency_key TEXT UNIQUE,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_nocase ON users (LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_subscribers_email_nocase ON newsletter_subscribers (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_user ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_docs_slug ON documentation_entries(slug);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON blog_posts(slug);
