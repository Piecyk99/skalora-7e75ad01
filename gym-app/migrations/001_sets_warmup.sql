-- Dla istniejącej bazy (już wykonane na produkcji 2026-10-12). Nowe instalacje: schema.sql ma kolumnę od razu.
ALTER TABLE sets ADD COLUMN warmup INTEGER NOT NULL DEFAULT 0;
