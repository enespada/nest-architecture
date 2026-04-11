---
description: 'Use when creating or editing NestJS source files in src/. Covers Clean Architecture boundaries, path aliases, repository wiring, and where code belongs in the nest-architecture template.'
applyTo: 'src/**/*.ts'
---

# Nest Clean Architecture

- Keep HTTP concerns in `src/api/**`: controllers, guards, decorators, and request DTO usage.
- Keep orchestration in `src/application/**`: use-case methods, payload DTOs, and repository interface consumption.
- Keep framework-agnostic contracts in `src/domain/**`: models and repository abstractions only.
- Keep persistence details in `src/infrastructure/**`: TypeORM entities, repository implementations, and mappers.
- Import through workspace aliases such as `@application/*`, `@domain/*`, `@infrastructure/*`, `@core/*`, and `@environments/*`.
- Map `Entity <-> Domain Model` explicitly in infrastructure mappers.
- In `*repository.impl.ts`, name injected `Repository<Entity>` instances after the entity in `lowerCamelCase` instead of generic names like `repository`.
- Do not inject TypeORM repositories into controllers or domain classes.
- When adding comments to code, write them in English only.
