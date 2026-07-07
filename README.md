# AI Caption Editor

An open-source, self-hostable AI Caption & Subtitle Editor application. It features automated transcription, real-time caption editing, translation, autosave version history, media uploads, and video export.

---

## Repository Structure

* [ai-caption-editor/](file:///Users/jarviskamal123gmail.com/Desktop/AI_SUBTITLE/ai-caption-editor) - Frontend SPA built with React, Vite, TailwindCSS, and TypeScript.
* [backend/](file:///Users/jarviskamal123gmail.com/Desktop/AI_SUBTITLE/backend) - Production-ready Spring Boot backend engine built with Java 21 and PostgreSQL.
* [docs/](file:///Users/jarviskamal123gmail.com/Desktop/AI_SUBTITLE/ai-caption-editor/docs) - Architectural Decision Records (ADRs) and design assets.

---

## Core Features

* **Auto-Transcription:** Automated speech-to-text transcribing via Ollama or OpenRouter.
* **Caption Redesign Tool:** Multi-speaker caption editing timeline.
* **Autosave History:** Roll back subtitles to any point in time.
* **Background Export Worker:** Renders subtitles and exports MP4, SRT, VTT, MP3, or TXT files.
* **Self-Hostable and Open Source:** Runs entirely locally using Docker Compose.

---

## Local Development & Setup

### Start the Entire Stack in One Command

You can run the entire backend and database with:

```bash
cd backend
docker compose up --build
```

The services will spin up:
- **PostgreSQL Database:** Running on port `5433` (development) and persisting data locally.
- **Spring Boot Backend:** Running on port `8080` (contexts mapped to `/api/v1/`).

---

## Quality, Testing, and Security

We maintain high quality and security standards across the codebase:

* **Static Analysis:** Uses Checkstyle, PMD, and SpotBugs. Run them using:
  ```bash
  cd backend
  mvn compile
  ```
* **Testing & Coverage:** Target at least 80% line coverage checked by JaCoCo. Run the test suite:
  ```bash
  cd backend
  mvn clean verify -Ddependency-check.skip=true
  ```
* **Security Controls:** Rate limiting and secure HTTP headers are configured natively inside the Spring Security filter chain.

---

## Documentation Index

For detailed instructions and architectures, see:

* [ARCHITECTURE.md](file:///Users/jarviskamal123gmail.com/Desktop/AI_SUBTITLE/ARCHITECTURE.md) - Design patterns, modular structures, and flows.
* [API.md](file:///Users/jarviskamal123gmail.com/Desktop/AI_SUBTITLE/API.md) - REST API routes, schemas, and usage examples.
* [CONTRIBUTING.md](file:///Users/jarviskamal123gmail.com/Desktop/AI_SUBTITLE/CONTRIBUTING.md) - Onboarding guide, coding standards, and PR workflows.
* [SECURITY.md](file:///Users/jarviskamal123gmail.com/Desktop/AI_SUBTITLE/SECURITY.md) - Vulnerability disclosures and policy guidelines.
* [CHANGELOG.md](file:///Users/jarviskamal123gmail.com/Desktop/AI_SUBTITLE/CHANGELOG.md) - Release history.
* [CODE_OF_CONDUCT.md](file:///Users/jarviskamal123gmail.com/Desktop/AI_SUBTITLE/CODE_OF_CONDUCT.md) - Contributor rules of engagement.
