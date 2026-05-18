---
name: nest-clean-feature
description: 'Implement or extend a NestJS feature in this template. Use when creating controllers, DTOs, application services, domain repositories, TypeORM repository implementations, or feature modules that must follow the project Clean Architecture.'
argument-hint: 'Describe the feature, affected layer, endpoint or use case, and any DTO or repository changes.'
user-invocable: true
---

# Nest Clean Feature

## When To Use

- Add a new API endpoint in `src/api/**`
- Extend a feature across `api`, `application`, `domain`, and `infrastructure`
- Add filters, pagination rules, repository methods, or Swagger docs
- Review whether a change belongs in the correct layer

## Procedure

1. Start from `.github/copilot-instructions.md` and `.github/instructions/clean-architecture.instructions.md`.
2. Locate the existing feature module and keep changes inside its current boundaries.
3. Define or update all DTOs in `src/application/**/dto`, pass controller DTOs directly from controllers to application services, and only add payload DTOs when data must be processed before reaching repositories.
4. Add or adjust domain contracts before changing infrastructure implementations.
5. Update repository implementations, entities, and mappers only in `src/infrastructure/**`.
6. Keep any new or moved module method in the same relative order across controller, service, repository contract, and repository implementation.
7. Run `npm run build` and the narrowest relevant test command before finishing.

## Project Reminders

- Use path aliases from `tsconfig.json`.
- Keep controllers thin and Swagger docs aligned with the real contract.
- Keep all DTO classes in `src/application/**/dto`; controllers should consume those DTOs directly and must not define parallel DTO classes in `src/api/**`.
- Pass controller DTOs directly from controllers to application services; do not add `*InputDTO` classes between those layers.
- Application services may receive the controller DTO plus extra scalars such as `userId` or `accessToken` when the use case needs authenticated context.
- Reserve `*-payload.dto.ts` for processed data passed to repositories or infrastructure collaborators.
- Delete obsolete DTO aliases once the canonical request DTO or payload DTO exists.
- Keep `*.spec.ts` files under `test/` instead of colocating them inside `src/`.
- In `*controller.ts`, keep the project's separator comment style before each endpoint block.
- In `*repository.impl.ts`, name injected `Repository<Entity>` fields after the entity in `lowerCamelCase`.
- Keep the same relative ordering for equivalent methods across the files of a module.
- When a method parameter uses a class-based type, name the parameter from that type in `lowerCamelCase` instead of generic names like `dto`.
- Write code comments in English only.
