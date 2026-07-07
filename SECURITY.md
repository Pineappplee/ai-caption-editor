# Security Policy

## Supported Versions

Only the latest stable release of the backend is supported for security updates.

| Version | Supported |
| ------- | --------- |
| v1.x    | Yes       |
| < v1.0  | No        |

## Reporting a Vulnerability

We take the security of our application seriously. If you find a security vulnerability, please do not open a public issue. Instead, report it privately following these steps:

1. Send an email to **security@aicaptioneditor.org** with details of the vulnerability.
2. Include a description of the issue, the impact, and steps to reproduce or a proof of concept (PoC).
3. We will acknowledge receipt of your report within 48 hours and work on a resolution.
4. Once resolved, we will publish a security advisory and credit you for the discovery.

## Security Practices

* **Dependency Scanning:** The project uses OWASP Dependency Check in the CI pipeline to block builds containing critical vulnerabilities.
* **Secret Detection:** Ensure no API keys, credentials, or signing secrets are committed to the repository.
* **Secure Headers:** Standard secure HTTP headers (CSP, HSTS, X-Content-Type-Options) are enforced via Spring Security config.
* **Input Validation:** Strict JSR-380 input validation is applied to all REST endpoints.
