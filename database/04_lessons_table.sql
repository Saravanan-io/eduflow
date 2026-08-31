-- Step 4: Create LESSONS Table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  video_url TEXT DEFAULT '',
  content TEXT DEFAULT '',
  duration INTEGER DEFAULT 0,
  lesson_order INTEGER NOT NULL,
  resources TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
