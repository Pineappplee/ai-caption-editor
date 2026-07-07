# Changelog

All notable changes to the AI Caption Editor Backend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-07-06

### Added
- **Code Quality Checkers:** Integrated Checkstyle, PMD, and SpotBugs plugins into the Maven verification pipeline.
- **Code Coverage:** Configured JaCoCo to measure test coverage, enforcing a minimum 80% line coverage threshold.
- **Security Enhancements:** Enforced secure HTTP headers (CSP, HSTS, frame options, X-Content-Type-Options, Referrer Policy) in Spring Security.
- **Rate Limiting:** Added a local, thread-safe client IP token-bucket rate limiter.
- **CI/CD Pipeline:** Created a GitHub Actions workflow that provisions a PostgreSQL service container, runs quality checks, compiles code, runs tests, and archives reports.
- **Docker Hardening:** Hardened the backend container configuration by introducing a non-root system user (`spring`), mapping uploads folder to a persistent volume, and configuring health checks.
- **Documentation:** Created complete, comprehensive developer guides: `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `ARCHITECTURE.md`, `API.md`, and `CHANGELOG.md`.
- **Unit and Repository Tests:** Implemented JPA database repository tests and unit tests for auth, projects, media, and user services.

### Fixed
- Fixed unused imports and modifier violations in existing source files identified during Checkstyle audits.
- Ensured consistent `/api/v1/` prefix routing across all controllers.
