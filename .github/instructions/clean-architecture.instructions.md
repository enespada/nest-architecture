---
description: 'Use when creating or editing NestJS source files in src/. Covers Clean Architecture boundaries, path aliases, repository wiring, and where code belongs in the nest-architecture template.'
applyTo: 'src/**/*.ts'
---

# Nest Clean Architecture

- Keep HTTP concerns in `src/api/**`: controllers, guards, decorators, and DTO consumption.
- Keep all DTO classes in `src/application/**/dto`; do not define parallel DTO classes in `src/api/**` and do not create `*InputDTO` adapters.
- Keep orchestration in `src/application/**`: use-case methods, request/response/filter/where DTOs, payload DTOs, and repository interface consumption.
- `*-payload.dto.ts` files in `src/application/**` are reserved for processed data sent to repositories or infrastructure boundaries.
- Repository contracts in `src/domain/**` may depend on application payload DTOs when those DTOs define the processed handoff into infrastructure.
- Keep framework-agnostic contracts in `src/domain/**`: models and repository abstractions only.
- Keep persistence details in `src/infrastructure/**`: TypeORM entities, repository implementations, and mappers.
- Import through workspace aliases such as `@application/*`, `@domain/*`, `@infrastructure/*`, `@core/*`, and `@environments/*`.
- Map `Entity <-> Domain Model` explicitly in infrastructure mappers.
- Keep public methods in the same relative order across the files of a feature or module when those methods are exposed in multiple layers, for example service, repository contract, and repository implementation.
- When a method parameter has a class-based type, use the type name in `lowerCamelCase` for the parameter name instead of generic names like `dto`.
- In `*repository.impl.ts`, name injected `Repository<Entity>` instances after the entity in `lowerCamelCase` instead of generic names like `repository`.
- Do not inject TypeORM repositories into controllers or domain classes.
- Keep `*.spec.ts` files under `test/`, mirroring the relevant feature structure instead of placing them inside `src/`.
- When adding comments to code, write them in English only.
