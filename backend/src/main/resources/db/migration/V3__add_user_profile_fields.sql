-- Migration to add profile bio and updated_at to users table
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
