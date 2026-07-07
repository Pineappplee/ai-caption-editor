# Database & Schemas (Self-Hosted PostgreSQL)

This directory contains the database initialization script (`init.sql`) and configurations to spin up a local PostgreSQL instance in Docker.

## Database Configurations
- **Database Engine**: PostgreSQL 16
- **Host Port**: `5433` (mapped to `5432` inside container to prevent collisions with other PostgreSQL services on `5432`)
- **Database Name**: `ai_caption_editor`
- **Username**: `postgres`
- **Password**: `postgres`
- **Connection URI**: `postgresql://postgres:postgres@localhost:5433/ai_caption_editor`

## Setup Instructions

### 1. Run the PostgreSQL Stack
From the project root (`ai-caption-editor/`), execute the following command:
```bash
docker compose up -d
```

### 2. Verify Schema Execution
Verify that the database container is healthy and the initialization script has executed correctly:
```bash
# Check if container is running
docker ps --filter name=ai-subtitle-postgres

# Verify the tables created
docker exec -it ai-subtitle-postgres psql -U postgres -d ai_caption_editor -c "\dt"
```

## Schema Reference

### Tables Created
1. `users`: Stores user credentials, profiles, plans.
2. `projects`: Main caption projects containing metadata.
3. `transcript_lines`: Timeline segments of transcript containing timestamps and words JSON structure.
4. `asset_folders`: Folder taxonomy for organizing uploaded media assets.
5. `media_assets`: Media uploads such as video, audio, image, and subtitle assets.
6. `export_jobs`: Export history and task status tracker.
