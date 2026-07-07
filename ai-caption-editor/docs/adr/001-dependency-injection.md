# ADR 001: Dependency Injection via React Context

## Status
Accepted

## Context
The application originally instantiated mock services directly inside custom hooks, Zustand stores, and React components. This created tight coupling to mock services and made it impossible to swap implementations (e.g. mock to Supabase/REST) without modifying the consumer files.

## Decision
We introduced a lightweight Dependency Injection (DI) layer combining:
1.  A centralized Service Container (`src/services/container.ts`) mapping keys to interface types.
2.  A React Context (`src/services/context.ts`) that supplies this container tree-wide.
3.  A custom `useServices()` hook for component consumption.

To avoid Vite Fast Refresh warning constraints for mixed component/hook exports in `.tsx` files, the context is written as pure `.ts` code using `React.createElement`.

## Consequences
- Components are decoupled from service instantiations.
- Easily testable: service implementations can be swapped by passing a different value to the context provider during tests.
- 100% backward compatible: falls back to default Mock services when no custom provider is registered.
