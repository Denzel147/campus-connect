-- Create Classrooms and Messages tables
CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    instructor VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for classroom memberships
CREATE TABLE IF NOT EXISTS classroom_memberships (
    id SERIAL PRIMARY KEY,
    classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role VARCHAR(20) DEFAULT 'member',
    UNIQUE(classroom_id, user_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    classroom_id INTEGER REFERENCES classrooms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    reply_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create message likes table
CREATE TABLE IF NOT EXISTS message_likes (
    id SERIAL PRIMARY KEY,
    message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(message_id, user_id)
);

-- Insert sample classrooms
INSERT INTO classrooms (name, code, description, instructor) VALUES
('Computer Science Year 2', 'CS202', 'Share textbooks and resources for CS second year courses', 'Dr. Smith'),
('Business Administration', 'BUS101', 'Exchange business books and case study materials', 'Prof. Johnson'),
('Data Science Club', 'DS301', 'Advanced data science resources and project collaboration', 'Dr. Lee'),
('Engineering Mathematics', 'MATH201', 'Mathematical textbooks and solution guides for engineering students', 'Prof. Brown')
ON CONFLICT (code) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classroom_memberships_classroom ON classroom_memberships(classroom_id);
CREATE INDEX IF NOT EXISTS idx_classroom_memberships_user ON classroom_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_classroom ON messages(classroom_id);
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_message_likes_message ON message_likes(message_id);
CREATE INDEX IF NOT EXISTS idx_message_likes_user ON message_likes(user_id);
