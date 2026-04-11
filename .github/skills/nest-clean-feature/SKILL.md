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
3. Define or update request DTOs in the API layer and payload DTOs in the application layer when needed.
4. Add or adjust domain contracts before changing infrastructure implementations.
5. Update repository implementations, entities, and mappers only in `src/infrastructure/**`.
6. Run `npm run build` and the narrowest relevant test command before finishing.

## Project Reminders

- Use path aliases from `tsconfig.json`.
- Keep controllers thin and Swagger docs aligned with the real contract.
- In `*controller.ts`, keep the project's separator comment style before each endpoint block.
- In `*repository.impl.ts`, name injected `Repository<Entity>` fields after the entity in `lowerCamelCase`.
- Write code comments in English only.
