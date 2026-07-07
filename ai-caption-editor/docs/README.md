# AI Caption Editor Architecture Documentation

Welcome to the architecture documentation for the AI Caption Editor. This directory details the modular design patterns implemented to support a long-term open-source community effort.

## Directory Structure

*   `docs/adr/`: Architecture Decision Records (ADRs) tracking historical design decisions.
*   `docs/providers/`: Specification and guides for implementing Custom Service Providers.
*   `docs/plugins/`: Guidelines for registering custom runtime plugins.
*   `docs/storage/`: Documenting the Storage Abstraction layer.
*   `docs/authentication/`: Guidelines for OAuth, JWT, and session management adapters.
*   `docs/api/`: stable API contract specifications.

## Zero-Cost & Local Development Principles

All architecture additions must prioritize:
1.  **Zero-Cost Local Development**: Mock and local filesystem fallbacks must remain fully operational.
2.  **No Vendor Lock-in**: All components and state management access services via abstract interfaces.
3.  **Docker Compatibility**: The codebase must build cleanly for containerized self-hosted setups.
