ALTER TABLE resources ADD COLUMN IF NOT EXISTS plate VARCHAR(50);
ALTER TABLE resources ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'car';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS current_km INT DEFAULT 0;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'available';
ALTER TABLE resources ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS bollo_expiry DATE;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS revision_expiry DATE;

UPDATE resources
SET plate = license_plate
WHERE plate IS NULL AND EXISTS (
  SELECT 1 FROM information_schema.columns
  WHERE table_name = 'resources' AND column_name = 'license_plate'
);

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS purpose VARCHAR(500);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS department VARCHAR(255);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS end_km INT;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS outlook_event_id VARCHAR(255);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS outlook_calendar_id VARCHAR(255);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'confirmed';

CREATE TABLE IF NOT EXISTS maintenance_records (
  id SERIAL PRIMARY KEY,
  resource_id INT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  cost NUMERIC(12, 2) DEFAULT 0,
  notes TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'planned',
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS reservations_resource_time_idx
  ON reservations (resource_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS maintenance_records_due_idx
  ON maintenance_records (due_date, status);