-- Create employee_profiles table to store detailed employee information
-- This includes brief profile, skills, past projects, and certifications

CREATE TABLE IF NOT EXISTS employee_profiles (
    employee_id VARCHAR(50) PRIMARY KEY REFERENCES employees(employee_id) ON DELETE CASCADE,
    brief_profile TEXT,
    primary_skills TEXT[],
    secondary_skills TEXT[],
    past_projects TEXT[],
    certifications TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_profiles_employee_id ON employee_profiles(employee_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_employee_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_employee_profiles_updated_at ON employee_profiles;
CREATE TRIGGER trigger_update_employee_profiles_updated_at
    BEFORE UPDATE ON employee_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_employee_profiles_updated_at();

-- Populate profile for EMP001 (John Doe)
INSERT INTO employee_profiles (
    employee_id,
    brief_profile,
    primary_skills,
    secondary_skills,
    past_projects,
    certifications
) VALUES (
    'EMP001',
    'GenAI Engineer with 3 years of experience specializing in Large Language Models and RAG systems. Passionate about building production-ready AI applications that solve real-world problems. Strong background in NLP, prompt engineering, and fine-tuning language models.',
    ARRAY['Large Language Models', 'RAG Systems', 'Prompt Engineering', 'Python', 'LangChain'],
    ARRAY['FastAPI', 'PostgreSQL', 'Vector Databases', 'Docker', 'AWS'],
    ARRAY[
        'Developed an enterprise RAG chatbot serving 10K+ users with 95% accuracy',
        'Built a multi-agent LLM system for automated code review and documentation',
        'Implemented fine-tuning pipeline for domain-specific language models'
    ],
    ARRAY[
        'AWS Certified Machine Learning - Specialty',
        'OpenAI API Professional Certificate',
        'Deep Learning Specialization - Coursera'
    ]
) ON CONFLICT (employee_id) DO UPDATE SET
    brief_profile = EXCLUDED.brief_profile,
    primary_skills = EXCLUDED.primary_skills,
    secondary_skills = EXCLUDED.secondary_skills,
    past_projects = EXCLUDED.past_projects,
    certifications = EXCLUDED.certifications,
    updated_at = CURRENT_TIMESTAMP;
