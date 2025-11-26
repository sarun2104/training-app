-- Fix quiz_responses table to support multi-answer questions
-- 1. Drop any existing check constraint on selected_answer
-- 2. Ensure column is TEXT type

-- Drop check constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.constraint_column_usage
        WHERE table_name = 'quiz_responses'
        AND column_name = 'selected_answer'
        AND constraint_name LIKE '%check%'
    ) THEN
        ALTER TABLE quiz_responses DROP CONSTRAINT quiz_responses_selected_answer_check;
    END IF;
END $$;

-- Ensure column is TEXT type
ALTER TABLE quiz_responses
ALTER COLUMN selected_answer TYPE TEXT;
