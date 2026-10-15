-- Rutyny mobilności w domu (osobno od sesji siłowych). Worker nie tworzy tej tabeli sam.
CREATE TABLE IF NOT EXISTS mobility (day TEXT NOT NULL, plan_id TEXT NOT NULL, done_at TEXT NOT NULL, PRIMARY KEY (day, plan_id));
