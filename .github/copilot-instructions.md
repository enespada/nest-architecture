# Project: Nest Architecture Template

## Overview

Production-ready NestJS template with a Clean Architecture split across api, application, domain, and infrastructure layers.

## Architecture

- Keep feature code aligned with the existing split under `src/api`, `src/application`, `src/domain`, and `src/infrastructure`.
- Controllers handle HTTP concerns, Swagger decorators, guards, and DTO usage only.
- Application services orchestrate use cases and depend on domain repository interfaces, not TypeORM.
- Domain models and repository contracts stay framework-agnostic.
- Infrastructure owns TypeORM entities, repository implementations, and mappers.
- Use path aliases from `tsconfig.json` such as `@application/*`, `@domain/*`, `@infrastructure/*`, and `@core/*`. Do not introduce long relative imports.
- See `README.md` for environment and Docker setup.

## Code Standards

- All DTOs must live in `src/application/**/dto`, including request, response, filter, where, and payload DTOs.
- Controllers may use DTOs defined in `src/application/**/dto`, but must not define parallel DTO classes in `src/api/**/dto` or create `*InputDTO` adapters between controllers and services.
- Application services may receive DTOs plus extra authenticated scalars such as `userId` or `accessToken` when the use case needs them.
- Reserve `*-payload.dto.ts` files for processed data in `src/application/**/dto`, mainly for repository contracts and infrastructure handoff.
- Use DTOs to separate raw endpoint input from processed payloads when the payload diverges from the controller contract, but keep both DTOs in `src/application/**/dto`.
- In `src/application/**/*.service.ts`, keep method parameters as grouped as possible: prefer regular DTOs or grouped objects over long lists of loose parameters.
- Service methods in `src/application/**/*.service.ts` must expose regular DTOs or grouped objects in their public signatures; `*-payload.dto.ts` types belong in repository contracts and repository implementations, not in the public application service API.
- Keep mapping explicit in infrastructure mappers; do not hide model translation inside controllers or services.
- Reuse `ExceptionFilter`, shared decorators, guards, and response DTOs from `src/core` instead of duplicating cross-cutting code.
- When adding code comments, write them in English only.
- Prefer concise comments and only add them when the code is not self-explanatory.
- Prefer explicit typing for local variables and method return types in touched code.
- In `*repository.impl.ts`, name injected `Repository<Entity>` fields after the entity in `lowerCamelCase`, for example `userBlockedRepository`.
- In `*controller.ts`, group endpoints with the existing separator comment style used in the project, for example `//-----------------------------------------------GET paginate-----------------------------------------------------------`.

## Build and Test

- Install: `npm install`
- Local stack: `docker compose up -d --build`
- Dev server: `npm run start:dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Place `*.spec.ts` files under `test/`, mirroring the feature structure there instead of colocating them under `src/`.

## Conventions

- Follow Conventional Commits as documented in `README.md`.
- Put feature-specific behavior in the feature module; keep shared concerns in `src/core`.
- Extend the existing repository token pattern, for example `'UserRepository'`, when wiring new infrastructure implementations.
- When the user corrects programming style or conventions, add that correction to this AI documentation so the same mistake is not repeated.
- Link to focused instructions instead of duplicating them: see `.github/instructions/clean-architecture.instructions.md`, `.github/instructions/api-and-dto.instructions.md`, and `.github/instructions/testing.instructions.md`.
