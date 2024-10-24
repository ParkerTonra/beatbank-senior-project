-- This file should undo anything in `up.sql`
-- Remove the trigger
DROP TRIGGER IF EXISTS set_row_order;

-- Remove the row_order column
ALTER TABLE beats DROP COLUMN row_order;