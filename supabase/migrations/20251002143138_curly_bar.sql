/*
  # Add max_downloads column to encrypted_files table

  1. Changes
    - Add `max_downloads` column to `encrypted_files` table
    - Allow NULL values for unlimited downloads
    - Add check constraint to ensure positive values

  2. Security
    - No changes to RLS policies needed
*/

-- Add max_downloads column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'encrypted_files' AND column_name = 'max_downloads'
  ) THEN
    ALTER TABLE encrypted_files
    ADD COLUMN max_downloads integer DEFAULT NULL;
  END IF;
END $$;

-- Add check constraint to ensure positive values when not null
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'max_downloads_positive'
  ) THEN
    ALTER TABLE encrypted_files
    ADD CONSTRAINT max_downloads_positive
    CHECK (max_downloads IS NULL OR max_downloads > 0);
  END IF;
END $$;

-- Add comment for documentation
COMMENT ON COLUMN encrypted_files.max_downloads IS 'Maximum number of downloads allowed. NULL means unlimited downloads.';