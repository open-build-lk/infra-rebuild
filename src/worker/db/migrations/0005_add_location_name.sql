-- Add location_name field to damage_reports for human-readable location
ALTER TABLE damage_reports ADD COLUMN location_name TEXT;
