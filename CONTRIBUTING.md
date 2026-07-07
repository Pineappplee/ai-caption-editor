# Contributing to AI Caption Editor Backend

Thank you for your interest in contributing! We welcome bug reports, feature requests, documentation improvements, and code changes.

## Development Setup

To set up the backend locally:

1. **Prerequisites:**
   - Java 21 JDK (Adoptium Temurin recommended)
   - Maven 3.9+
   - Docker and Docker Compose (to run the PostgreSQL database locally)

2. **Start Database:**
   ```bash
   cd backend
   docker compose up postgres -d
   ```
   This starts PostgreSQL on port `5433` (configured for development).

3. **Build Project:**
   ```bash
   mvn clean install
   ```

4. **Run Application:**
   ```bash
   mvn spring-boot:run
   ```

## Code Quality Standards

The project enforces strict code quality and formatting rules during compilation. If these checks fail, the build will fail:

* **Formatting & Style (Checkstyle):**
  Checkstyle checks are executed during the `validate` phase of the Maven build:
  ```bash
  mvn checkstyle:check
  ```
  Rules are defined in `config/checkstyle/checkstyle.xml`.

* **Static Analysis (PMD):**
  PMD checks are executed during the `verify` phase:
  ```bash
  mvn pmd:check
  ```
  Rules are defined in `config/pmd/ruleset.xml`.

* **Bug Finding (SpotBugs):**
  SpotBugs checks run during the `verify` phase:
  ```bash
  mvn spotbugs:check
  ```
  Exclusions are defined in `config/spotbugs/exclude.xml`.

* **Testing Requirements:**
  We target **at least 80% line/instruction code coverage** checked via JaCoCo:
  ```bash
  mvn clean verify
  ```
  This command runs all checks, runs all unit and integration tests, generates reports, and asserts coverage limits.

## Pull Request Guidelines

1. Fork the repository and create your branch from `main`.
2. Write clean code conforming to the style checks.
3. Add unit tests for services, integration tests for controllers, and repository tests if you introduce new queries.
4. Run `mvn clean verify` locally to ensure the build succeeds.
5. Create a pull request describing the changes and linking any open issues.
