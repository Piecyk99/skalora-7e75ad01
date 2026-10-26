-- Dla istniejącej bazy. Worker dodaje tę kolumnę sam przy pierwszym żądaniu (ensureSchema), więc ręczne uruchomienie nie jest konieczne.
ALTER TABLE sessions ADD COLUMN layout TEXT;
