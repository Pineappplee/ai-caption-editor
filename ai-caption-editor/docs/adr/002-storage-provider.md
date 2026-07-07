# ADR 002: Storage Provider Abstraction

## Status
Accepted

## Context
Components and mock services originally called `window.localStorage` and `window.sessionStorage` directly. This limits extensibility to backend storage engines like PostgreSQL, IndexedDB, or Cloud Storage, and violates the separation of concerns.

## Decision
We introduced a Storage Provider layer:
1.  An abstract `IStorageProvider` interface declaring asynchronous key-value persistence.
2.  `LocalStorageProvider` and `MemoryStorageProvider` implementations.
3.  A `StorageRegistry` allowing runtime configuration.
4.  Refactored settings and other services to utilize `StorageRegistry.getProvider()` instead of browser global variables.

## Consequences
- The editor core is completely agnostic of the physical storage location.
- Enabled zero-cost in-memory tests and local persistence out-of-the-box.
- Enables future integration with cloud storage (S3/R2) or databases (Postgres) by writing a simple adapter class.
