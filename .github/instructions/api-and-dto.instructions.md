---
description: 'Use when adding or changing NestJS controllers, request DTOs, pagination DTOs, or Swagger documentation. Covers validation, controller scope, and API contract patterns.'
applyTo: 'src/api/**/*.ts,src/application/**/*.ts'
---

# API And DTO Guidelines

- Controllers should delegate business logic to application services and stay thin.
- Validate request DTOs with `class-validator` decorators at the API boundary.
- Use Swagger decorators to document route params, query params, request bodies, and response shapes.
- In controllers, add the visual separator comments already used in the project before each endpoint block, for example `//-----------------------------------------------GET paginate-----------------------------------------------------------`.
- When the application payload differs from the request DTO, create a dedicated payload DTO in `src/application/**/dto`.
- Keep pagination and filtering contracts explicit instead of relying on loose `Partial<T>` types when virtual fields exist.
- Reuse shared decorators from `src/core/decorators` and guards from `src/core/middlewares`.
- Write code comments in English only.
