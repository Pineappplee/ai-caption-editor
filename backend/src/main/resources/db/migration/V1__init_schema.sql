-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users & Profiles
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN ('Draft', 'In Progress', 'Complete')),
    language VARCHAR(100),
    duration INTEGER DEFAULT 0, -- Duration in seconds
    segments_count INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transcript Lines
CREATE TABLE IF NOT EXISTS transcript_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    start_time INTEGER NOT NULL, -- in milliseconds
    end_time INTEGER NOT NULL, -- in milliseconds
    text TEXT NOT NULL,
    words JSONB DEFAULT '[]'::jsonb, -- array of { id, text, start, end }
    speaker_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Asset Folders
CREATE TABLE IF NOT EXISTS asset_folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES asset_folders(id) ON DELETE SET NULL
);

-- Media Assets
CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('video', 'audio', 'image', 'gif', 'subtitle')),
    filename VARCHAR(255) NOT NULL,
    thumbnail_url TEXT,
    original_url TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    format VARCHAR(50),
    tags TEXT[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    folder_id UUID REFERENCES asset_folders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Export Jobs
CREATE TABLE IF NOT EXISTS export_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    format VARCHAR(50) NOT NULL CHECK (format IN ('mp4', 'srt', 'vtt', 'mp3', 'txt')),
    status VARCHAR(50) DEFAULT 'queued' CHECK (status IN ('queued', 'exporting', 'completed', 'failed')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    download_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_transcript_lines_project_id ON transcript_lines(project_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_project_id ON media_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_folder_id ON media_assets(folder_id);
CREATE INDEX IF NOT EXISTS idx_asset_folders_project_id ON asset_folders(project_id);
CREATE INDEX IF NOT EXISTS idx_export_jobs_project_id ON export_jobs(project_id);
