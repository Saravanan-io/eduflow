-- Step 5: Create ENROLLMENTS Table
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_lessons UUID[] DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_student_course UNIQUE (student_id, course_id)
);
