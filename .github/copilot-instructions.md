# Project: Nest Architecture Template

## Overview

Production-ready NestJS template with a Clean Architecture split across api, application, domain, and infrastructure layers.

## Architecture

- Keep feature code aligned with the existing split under `src/api`, `src/application`, `src/domain`, and `src/infrastructure`.
- Controllers handle HTTP concerns, Swagger decorators, guards, and request DTOs only.
- Application services orchestrate use cases and depend on domain repository interfaces, not TypeORM.
- Domain models and repository contracts stay framework-agnostic.
- Infrastructure owns TypeORM entities, repository implementations, and mappers.
- Use path aliases from `tsconfig.json` such as `@application/*`, `@domain/*`, `@infrastructure/*`, and `@core/*`. Do not introduce long relative imports.
- See `README.md` for environment and Docker setup.

## Code Standards

- Use DTOs to separate API input from application payloads when the payload diverges from the request contract.
- Keep mapping explicit in infrastructure mappers; do not hide model translation inside controllers or services.
- Reuse `ExceptionFilter`, shared decorators, guards, and response DTOs from `src/core` instead of duplicating cross-cutting code.
- When adding code comments, write them in English only.
- Prefer concise comments and only add them when the code is not self-explanatory.

## Build and Test

- Install: `npm install`
- Local stack: `docker compose up -d --build`
- Dev server: `npm run start:dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`

## Conventions

- Follow Conventional Commits as documented in `README.md`.
- Put feature-specific behavior in the feature module; keep shared concerns in `src/core`.
- Extend the existing repository token pattern, for example `'UserRepository'`, when wiring new infrastructure implementations.
- Link to focused instructions instead of duplicating them: see `.github/instructions/clean-architecture.instructions.md`, `.github/instructions/api-and-dto.instructions.md`, and `.github/instructions/testing.instructions.md`.
