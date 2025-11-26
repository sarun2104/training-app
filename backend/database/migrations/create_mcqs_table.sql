-- Create MCQs table for storing multiple choice questions
-- This table stores questions that can have single or multiple correct answers

CREATE TABLE IF NOT EXISTS mcqs (
    question_id VARCHAR(50) PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answers TEXT[] NOT NULL,  -- Array to store correct answer(s): ['A'], ['B', 'C'], etc.
    multiple_answer_flag BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on question_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_mcqs_question_id ON mcqs(question_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_mcqs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_mcqs_updated_at ON mcqs;
CREATE TRIGGER trigger_mcqs_updated_at
    BEFORE UPDATE ON mcqs
    FOR EACH ROW
    EXECUTE FUNCTION update_mcqs_updated_at();
