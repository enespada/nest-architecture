# Plan: user phonePreffix + phone + language end-to-end

## Metadata

- **scope:** feature
- **topology:** dag-waves
- **mode:** mixed
- **stack:** nestjs + typeorm + class-validator + swagger
- **affected_modules:** [user (modify), auth (modify), shared database migrations (modify), tests (modify)]
- **estimated_waves:** 10
- **estimated_tokens:** ~29K
- **conversation_budget:** 1
- **conversation_cuts:** ["after Wave 4T if review discovers contract drift", "after Wave R if migration wiring needs adjustment"]
- **guardrails:** [build, lint, unit-test, e2e-test, import-check, migration-check, swagger-contract-check]
- **review_mode:** single
- **testing_mode:** adjacent
- **template_used:** none

## Scope Decision

This is **not micro** because the change crosses persistence, domain contract, request DTOs, response serialization, auth registration flow, and existing test fixtures that manually instantiate `User`.

It is still **small enough for direct execution in one conversation** if the worker follows the wave order strictly. The migration plus regression surface on existing tests is the reason to keep an explicit wave plan instead of treating it as a single blind patch.

## Wave 0 — Contracts [STANDARD]

### Task 0A: Extend user request and payload DTO contracts

- **type:** MODIFY
- **depends_on:** none
- **files:**
  - src/application/user/dto/create-user.dto.ts (modify)
  - src/application/user/dto/create-user-payload.dto.ts (modify)
  - src/application/user/dto/update-user.dto.ts (modify)
  - src/application/user/dto/update-user-payload.dto.ts (modify)
  - src/application/auth/dto/register-request.dto.ts (modify)
- **existing_context:**
  - **read_files:** [src/application/user/dto/create-user.dto.ts, src/application/user/dto/create-user-payload.dto.ts, src/application/user/dto/update-user.dto.ts, src/application/user/dto/update-user-payload.dto.ts, src/application/auth/dto/register-request.dto.ts]
- **change_description:**
  > Add `phonePreffix`, `phone`, and `language` to the canonical creation contract in application. Preserve validation decorators and Swagger metadata on request-facing DTOs. Keep register DTO aligned with create-user DTO without introducing parallel DTOs under api.
- **guardrails:** [build, lint, swagger-contract-check]
- **est_tokens:** ~3.8K

## Wave 1 — Domain [SEQUENTIAL]

### Task 1A: Extend the user domain model contract

- **type:** MODIFY
- **depends_on:** [0A]
- **files:**
  - src/domain/user/models/user.model.ts (modify)
- **existing_context:**
  - **read_files:** [src/domain/user/models/user.model.ts]
- **change_description:**
  > Add the three new scalar fields to the framework-agnostic `User` model and keep constructor/property ordering coherent with the rest of the codebase. Do not introduce persistence concerns into domain.
- **guardrails:** [build, import-check]
- **est_tokens:** ~0.8K

## Wave 2 — Infrastructure [PARALLEL]

### Task 2A: Persist the new user columns and mapping

- **type:** MODIFY
- **depends_on:** [1A]
- **files:**
  - src/infrastructure/user/entities/user.entity.ts (modify)
  - src/infrastructure/user/mappers/user.mapper.ts (modify)
- **existing_context:**
  - **read_files:** [src/infrastructure/user/entities/user.entity.ts, src/infrastructure/user/mappers/user.mapper.ts]
  - **read_interfaces:** [src/domain/user/models/user.model.ts]
- **change_description:**
  > Add `phonePreffix`, `phone`, and `language` as persisted columns and map them explicitly in both directions. Preserve existing block-related flags and current field semantics.
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~2.2K

### Task 2B: Thread the new fields through repository persistence flows

- **type:** MODIFY
- **depends_on:** [0A, 1A, 2A]
- **files:**
  - src/domain/user/user.repository.ts (modify)
  - src/infrastructure/user/user.repository.impl.ts (modify)
- **existing_context:**
  - **read_files:** [src/domain/user/user.repository.ts, src/infrastructure/user/user.repository.impl.ts]
  - **read_interfaces:** [src/application/user/dto/create-user-payload.dto.ts, src/application/user/dto/update-user-payload.dto.ts]
- **change_description:**
  > Keep create and update repository signatures aligned with the enriched payload DTOs and ensure read methods return the new scalars through the mapper. Preserve existing method order relative to service and implementation files.
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~2.0K

### Task 2C: Add an incremental TypeORM migration for the current schema

- **type:** CREATE
- **depends_on:** [2A]
- **files:**
  - src/infrastructure/shared/database/migrations/<timestamp>-add-user-phone-language.ts (new)
- **existing_context:**
  - **read_files:** [src/infrastructure/shared/database/migrations/1714399200000-initial-schema.ts]
- **change_description:**
  > Create a manual incremental migration that alters `user_entity` with the three new columns and defines a safe `down` path. Do not edit the initial schema migration.
- **guardrails:** [build, migration-check]
- **est_tokens:** ~1.4K

## Wave 3 — Application [SEQUENTIAL]

### Task 3A: Align user creation and update orchestration with the enriched contract

- **type:** MODIFY
- **depends_on:** [2B]
- **files:**
  - src/application/user/user.service.ts (modify)
- **existing_context:**
  - **read_files:** [src/application/user/user.service.ts]
  - **read_interfaces:** [src/domain/user/user.repository.ts]
- **change_description:**
  > Keep `create` and `update` payload construction explicit and type-safe so the new fields flow to persistence together with password encryption. Preserve public signatures based on regular DTOs.
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~1.1K

### Task 3B: Keep auth registration aligned with the user creation contract

- **type:** MODIFY
- **depends_on:** [0A, 3A]
- **files:**
  - src/application/auth/auth.service.ts (modify)
- **existing_context:**
  - **read_files:** [src/application/auth/auth.service.ts]
  - **read_interfaces:** [src/application/auth/dto/register-request.dto.ts, src/application/user/dto/create-user.dto.ts]
- **change_description:**
  > Ensure the register use case forwards the expanded contract unchanged to `UserService.create`. Keep auth-specific concerns in auth service and avoid duplicating field mapping logic.
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~0.9K

## Wave 3T — Application Tests [PARALLEL]

### Task 3T-A: Update user service unit coverage for the expanded payloads

- **type:** MODIFY
- **depends_on:** [3A]
- **files:**
  - src/application/user/user.service.spec.ts (modify)
- **existing_context:**
  - **read_files:** [src/application/user/user.service.spec.ts]
- **change_description:**
  > Update fixtures, constructor calls, and any create/update expectations to include `phonePreffix`, `phone`, and `language`.
- **guardrails:** [unit-test, build]
- **est_tokens:** ~1.2K

### Task 3T-B: Update auth service unit coverage for register forwarding

- **type:** MODIFY
- **depends_on:** [3B]
- **files:**
  - src/application/auth/auth.service.spec.ts (modify)
- **existing_context:**
  - **read_files:** [src/application/auth/auth.service.spec.ts]
- **change_description:**
  > Expand the register request fixture factory and assertions so the new fields remain part of the forwarded DTO contract.
- **guardrails:** [unit-test, build]
- **est_tokens:** ~1.2K

### Task 3T-C: Update user-blocked service test fixtures affected by `User` constructor changes

- **type:** MODIFY
- **depends_on:** [1A]
- **files:**
  - src/application/user-blocked/user-blocked.service.spec.ts (modify)
- **existing_context:**
  - **read_files:** [src/application/user-blocked/user-blocked.service.spec.ts]
- **change_description:**
  > Adjust local user factories so the test suite keeps compiling after the domain model grows. Do not widen the behavioral scope of these tests.
- **guardrails:** [unit-test, build]
- **est_tokens:** ~0.9K

## Wave 4 — API Contract Surface [SEQUENTIAL]

### Task 4A: Expose the new fields on create/register endpoint contracts

- **type:** MODIFY
- **depends_on:** [0A, 3B]
- **files:**
  - src/api/user/user.controller.ts (modify)
  - src/api/auth/auth.controller.ts (modify)
- **existing_context:**
  - **read_files:** [src/api/user/user.controller.ts, src/api/auth/auth.controller.ts]
  - **read_interfaces:** [src/application/user/dto/create-user.dto.ts, src/application/auth/dto/register-request.dto.ts, src/domain/user/models/user.model.ts]
- **change_description:**
  > Keep controllers thin while ensuring Swagger reflects the expanded request and response contract for create/register endpoints. Preserve the current separator comments and method ordering.
- **guardrails:** [build, lint, swagger-contract-check]
- **est_tokens:** ~1.5K

## Wave 4T — API / E2E Tests [PARALLEL]

### Task 4T-A: Add contract coverage for auth register with the new fields

- **type:** CREATE
- **depends_on:** [4A]
- **files:**
  - test/auth-register.e2e-spec.ts (new)
- **guardrails:** [e2e-test, build]
- **est_tokens:** ~1.6K

### Task 4T-B: Update auth refresh and sign-out contract fixtures impacted by `User`

- **type:** MODIFY
- **depends_on:** [1A]
- **files:**
  - test/auth-refresh.e2e-spec.ts (modify)
  - test/auth-sign-out.e2e-spec.ts (modify)
- **existing_context:**
  - **read_files:** [test/auth-refresh.e2e-spec.ts, test/auth-sign-out.e2e-spec.ts]
- **change_description:**
  > Fix manual `new User(...)` constructions so the auth contract tests still compile after the domain model grows. Keep their behavioral scope unchanged.
- **guardrails:** [e2e-test, build]
- **est_tokens:** ~1.3K

### Task 4T-C: Update user-blocked e2e fixtures impacted by `User`

- **type:** MODIFY
- **depends_on:** [1A]
- **files:**
  - test/user-blocked.e2e-spec.ts (modify)
- **existing_context:**
  - **read_files:** [test/user-blocked.e2e-spec.ts]
- **change_description:**
  > Update authenticated user fixtures and any assertions that depend on the serialized `User` shape. Do not change the blocked-user behavior under test.
- **guardrails:** [e2e-test, build]
- **est_tokens:** ~1.4K

## Wave 5 — Wiring [SEQUENTIAL]

### Task 5A: Register the incremental migration in TypeORM configuration

- **type:** MODIFY
- **depends_on:** [2C]
- **files:**
  - src/infrastructure/shared/database/typeorm.config.ts (modify)
- **existing_context:**
  - **read_files:** [src/infrastructure/shared/database/typeorm.config.ts]
- **change_description:**
  > Add the new migration class to the migration class list without altering existing entity registration or the initial schema migration.
- **guardrails:** [build, migration-check, import-check]
- **est_tokens:** ~0.8K

## Wave R — Review

### Task R1: Review regression surface and contract consistency end-to-end

- **type:** REVIEW
- **depends_on:** [5A, 3T-A, 3T-B, 3T-C, 4T-A, 4T-B, 4T-C]
- **files:**
  - src/application/user/dto/create-user.dto.ts (review)
  - src/application/auth/dto/register-request.dto.ts (review)
  - src/domain/user/models/user.model.ts (review)
  - src/infrastructure/user/entities/user.entity.ts (review)
  - src/infrastructure/user/mappers/user.mapper.ts (review)
  - src/infrastructure/user/user.repository.impl.ts (review)
  - src/application/user/user.service.ts (review)
  - src/application/auth/auth.service.ts (review)
  - src/infrastructure/shared/database/migrations/<timestamp>-add-user-phone-language.ts (review)
  - test/auth-register.e2e-spec.ts (review)
- **guardrails:** [build, lint, unit-test, e2e-test, migration-check, swagger-contract-check]
- **est_tokens:** ~4.6K

## Wave ARCH — Architecture Validation

### Task ARCH-1: Validate layer boundaries and DTO placement

- **type:** REVIEW
- **depends_on:** [R1]
- **files:**
  - src/api/auth/auth.controller.ts (review)
  - src/api/user/user.controller.ts (review)
  - src/application/user/dto/create-user.dto.ts (review)
  - src/application/user/dto/update-user-payload.dto.ts (review)
  - src/domain/user/user.repository.ts (review)
  - src/infrastructure/user/user.repository.impl.ts (review)
- **guardrails:** [import-check, build]
- **est_tokens:** ~2.3K

## DAG Visual

```text
0A
|
+--> 1A
     |
     +--> 2A --> 2B --> 3A --> 3T-A
     |      |      |
     |      |      +--> 3B --> 3T-B
     |      |
     |      +--> 2C --> 5A
     |
     +--> 3T-C
     +--> 4T-B
     +--> 4T-C

0A + 3B --> 4A --> 4T-A

3T-A + 3T-B + 3T-C + 4T-A + 4T-B + 4T-C + 5A --> R1 --> ARCH-1
```

## Cost Estimate

| Wave      | Tasks  | Type   | Est. Input Tokens | Est. Output Tokens |
| --------- | ------ | ------ | ----------------- | ------------------ |
| 0         | 1      | MODIFY | 2.4K              | 1.4K               |
| 1         | 1      | MODIFY | 0.5K              | 0.3K               |
| 2         | 3      | MIXED  | 3.7K              | 1.9K               |
| 3         | 2      | MODIFY | 1.3K              | 0.7K               |
| 3T        | 3      | MODIFY | 2.2K              | 1.1K               |
| 4         | 1      | MODIFY | 1.0K              | 0.5K               |
| 4T        | 3      | MIXED  | 2.9K              | 1.4K               |
| 5         | 1      | MODIFY | 0.5K              | 0.3K               |
| R         | 1      | REVIEW | 2.6K              | 2.0K               |
| ARCH      | 1      | REVIEW | 1.3K              | 1.0K               |
| **Total** | **17** |        | **18.4K**         | **10.6K**          |

**Estimated total:** ~29K tokens
**Context budget:** 1 conversation, with explicit cut points only as fallback
**CREATE : MODIFY ratio:** 2 : 15

## Risks & Mitigations

| Riesgo                                                                                        | Probabilidad | Mitigación                                                                                                     |
| --------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------- |
| El campo `phonePreffix` mantiene una grafía no estándar pero ya forma parte del requerimiento | Media        | Mantener exactamente `phonePreffix` en DTOs, modelo, entidad y migración para evitar desalineación contractual |
| `RegisterRequestDTO` hereda de `CreateUserDTO` y Swagger puede quedar implícito               | Media        | Revisar la documentación expuesta en Wave 4 y redeclarar solo si la metadata heredada no aparece correctamente |
| Los tests existentes instancian `User` manualmente y pueden romper por orden de constructor   | Alta         | Ajustar fixtures en Wave 3T y 4T antes de ampliar el alcance funcional                                         |
| La migración nueva puede olvidarse en `typeOrmMigrationClasses`                               | Alta         | Reservar Wave 5 para wiring de migraciones y validar con migration-check                                       |
| `UpdateUserPayloadDTO` está casi vacío y puede ocultar fallos de tipado                       | Media        | Hacer explícitos los nuevos campos en Wave 0 para que el compilador obligue a propagarlos                      |
