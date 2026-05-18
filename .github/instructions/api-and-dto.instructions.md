---
description: 'Use when adding or changing NestJS controllers, request DTOs, pagination DTOs, or Swagger documentation. Covers validation, controller scope, and API contract patterns.'
applyTo: 'src/api/**/*.ts,src/application/**/*.ts'
---

# API And DTO Guidelines

- Controllers should delegate business logic to application services and stay thin.
- All DTOs must live in `src/application/**/dto`, including request DTOs used by endpoint bodies.
- Validate request-facing DTOs with `class-validator` decorators at the API boundary even when the DTO class lives in `src/application/**/dto`.
- Use Swagger decorators to document route params, query params, request bodies, and response shapes.
- In controllers, add the visual separator comments already used in the project before each endpoint block, for example `//-----------------------------------------------GET paginate-----------------------------------------------------------`.
- Keep controller methods in the same relative order used by the rest of the module files when the same use case also appears in services and repositories.
- When a controller or service method receives a class-based DTO parameter, name it with the DTO type in `lowerCamelCase`, for example `usernameAvailabilityQueryDto`.
- Controllers must use DTOs imported from `src/application/**/dto` and pass them directly to application services; do not create `*InputDTO` classes as controller-service adapters.
- Application services may receive the controller DTO plus extra scalar parameters such as `userId` or `accessToken` when needed.
- When the processed payload differs from the DTO used by the controller, create a dedicated payload DTO in `src/application/**/dto`.
- Reserve `*-payload.dto.ts` for processed data handed to repositories or infrastructure collaborators.
- Remove obsolete duplicate DTOs or aliases once the request DTO and payload DTO replacements are in place.
- Keep pagination and filtering contracts explicit instead of relying on loose `Partial<T>` types when virtual fields exist.
- Reuse shared decorators from `src/core/decorators` and guards from `src/core/middlewares`.
- Write code comments in English only.
