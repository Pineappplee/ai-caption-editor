# ADR 004: Plugin Architecture

## Status
Accepted

## Context
As an open-source project, developers should be able to extend the application's capabilities (new storage backends, importers, exporters, AI models) without submitting pull requests that modify the editor's core codebase.

## Decision
We introduced a Plugin Architecture:
1.  An `IPlugin` interface requiring a `register(registry)` method.
2.  A `PluginManager` that registers custom AI providers, storage adapters, lower third templates, custom exporters, and timeline tools.
3.  An initialization cycle that executes plugin registrations at startup.

## Consequences
- Clean separation of the core editor platform from third-party plugins.
- Preserves stability of core APIs while allowing maximum community customization.
