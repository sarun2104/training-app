-- Alter quiz_responses table to support multi-answer questions
-- Change selected_answer from CHAR(1) to TEXT to support arrays like '{A,C}'

ALTER TABLE quiz_responses
ALTER COLUMN selected_answer TYPE TEXT;
