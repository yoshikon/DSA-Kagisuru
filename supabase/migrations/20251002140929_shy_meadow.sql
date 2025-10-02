/*
  # Add require_verification column to encrypted_files table

  1. Changes
    - Add `require_verification` column to `encrypted_files` table
    - Set default value to `true` for security
    - Update existing records to have `require_verification = true`

  2. Security
    - Maintains existing RLS policies
    - Ensures backward compatibility
*/

-- Add the require_verification column to encrypted_files table
ALTER TABLE encrypted_files 
ADD COLUMN IF NOT EXISTS require_verification BOOLEAN DEFAULT TRUE;

-- Update any existing records to have require_verification = true
UPDATE encrypted_files 
SET require_verification = TRUE 
WHERE require_verification IS NULL;