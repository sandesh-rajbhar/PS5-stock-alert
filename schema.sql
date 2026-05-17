-- Stores each subscriber
CREATE TABLE subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT,                                            -- Nullable: Telegram-only subscribers have no email
  pincode TEXT NOT NULL,
  notify_email BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT FALSE,                       -- Flips to TRUE after email OR Telegram confirm
  unsubscribe_token TEXT DEFAULT gen_random_uuid()::TEXT,
  confirm_token TEXT DEFAULT gen_random_uuid()::TEXT,    -- Used by /api/confirm and Telegram /start
  telegram_chat_id TEXT,                                 -- Set when user links Telegram via webhook
  UNIQUE(email)
);

-- Stores latest stock status per platform (national baseline)
CREATE TABLE stock_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,           -- 'amazon' | 'flipkart' | 'croma' | 'vijaysales' | 'reliancedigital'
  product_name TEXT,
  in_stock BOOLEAN DEFAULT FALSE,
  price TEXT,
  product_url TEXT,
  is_pincode_dependent BOOLEAN DEFAULT FALSE,
  last_checked TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform)
);

-- Per-pincode stock cache (used for every platform to track local stock changes)
CREATE TABLE quick_commerce_stock (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  pincode TEXT NOT NULL,
  in_stock BOOLEAN DEFAULT FALSE,
  price TEXT,
  product_url TEXT,
  delivery_time TEXT,
  last_checked TIMESTAMP DEFAULT NOW(),
  UNIQUE(platform, pincode)
);

-- Audit log of every stock change
CREATE TABLE stock_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  platform TEXT NOT NULL,
  became_in_stock BOOLEAN,
  price TEXT,
  product_url TEXT,
  event_time TIMESTAMP DEFAULT NOW()
);

-- Track which subscribers were notified
CREATE TABLE notification_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscriber_id UUID REFERENCES subscribers(id),
  stock_event_id UUID REFERENCES stock_events(id),
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_commerce_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public can read stock status" ON stock_status FOR SELECT USING (true);
CREATE POLICY "Public can read quick commerce stock" ON quick_commerce_stock FOR SELECT USING (true);

-- ============================================================================
-- MIGRATION: run against existing databases that were created before the
-- double-opt-in + Telegram changes. Safe to re-run.
-- ============================================================================
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirm_token TEXT DEFAULT gen_random_uuid()::TEXT;
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;
ALTER TABLE subscribers ALTER COLUMN is_active SET DEFAULT FALSE;
ALTER TABLE subscribers ALTER COLUMN email DROP NOT NULL;   -- Telegram-only signups have no email
UPDATE subscribers SET confirm_token = gen_random_uuid()::TEXT WHERE confirm_token IS NULL;
