/*
  # Add max_downloads column to encrypted_files table

  1. Changes
    - Add `max_downloads` column to `encrypted_files` table
    - Allow NULL values for unlimited downloads
    - Add check constraint to ensure positive values

  2. Security
    - No changes to RLS policies needed
*/

-- Add max_downloads column
ALTER TABLE encrypted_files 
ADD COLUMN max_downloads integer DEFAULT NULL;

-- Add check constraint to ensure positive values when not null
ALTER TABLE encrypted_files 
ADD CONSTRAINT max_downloads_positive 
CHECK (max_downloads IS NULL OR max_downloads > 0);

-- Add comment for documentation
COMMENT ON COLUMN encrypted_files.max_downloads IS 'Maximum number of downloads allowed. NULL means unlimited downloads.';