-- Add the row_order column as NOT NULL with a default value
ALTER TABLE beats ADD COLUMN row_order INTEGER NOT NULL DEFAULT 0;

-- Update the row_order column to have sequential values starting from 1
UPDATE beats
SET row_order = (
    SELECT COUNT(*)
    FROM beats AS b
    WHERE b.id <= beats.id
);

-- Create a trigger to set the row_order for new rows
CREATE TRIGGER set_row_order
AFTER INSERT ON beats
FOR EACH ROW
BEGIN
    UPDATE beats 
    SET row_order = (
        SELECT COUNT(*) 
        FROM beats
    )
    WHERE id = NEW.id;
END;