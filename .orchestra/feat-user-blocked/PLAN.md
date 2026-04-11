# Plan: user-blocked

## Metadata

- **scope:** module
- **topology:** dag-waves
- **mode:** mixed
- **stack:** nestjs + typeorm + class-validator + swagger
- **affected_modules:** [user (modify), user-blocked (new), app.module (modify)]
- **estimated_waves:** 10
- **estimated_tokens:** ~52K
- **conversation_budget:** 2
- **conversation_cuts:** ["after Wave 4T", "after Wave R"]
- **guardrails:** [build, lint, unit-test, e2e-test, import-check, swagger-contract-check, flutter-contract-check]
- **review_mode:** eval-optimizer
- **testing_mode:** adjacent
- **template_used:** none

## Scope Decision

This is **not** micro. The feature requires a new persisted relation, a new module, new authenticated endpoints, cross-layer user contract updates, contextual user serialization, and test coverage across service and API layers.

## Wave 0 — Contracts [STANDARD]

**Agent:** NestJS Developer

### Task 0A: Define cross-feature user response and blocked pagination contracts

- **type:** MIXED
- **depends_on:** none
- **files:**
  - src/domain/user/models/user.model.ts (modify)
  - src/application/user-blocked/dto/user-blocked-where.dto.ts (new)
  - src/application/user-blocked/dto/user-blocked-pagination-options.dto.ts (new)
- **existing_context:**
  - **read_files:** [src/domain/user/models/user.model.ts, src/application/user/dto/user-pagination-options.dto.ts, src/application/user/dto/user-where.dto.ts]
- **change_description:**
  > Add optional user flags isBlockedByLogged and blockedLogged to the user contract consumed by Flutter. Define explicit pagination and filter DTOs for blocked users with where[fullName], where[userName], limit, and offset. Do not introduce a PageDTO dependency for the blocked list contract.
- **guardrails:** [build, import-check, swagger-contract-check, flutter-contract-check]
- **est_tokens:** ~2.2K

### Task 0B: Define repository contracts for blocked relation and contextualized user reads

- **type:** MIXED
- **depends_on:** [0A]
- **files:**
  - src/domain/user/user.repository.ts (modify)
  - src/domain/user-blocked/user-blocked.repository.ts (new)
- **existing_context:**
  - **read_files:** [src/domain/user/user.repository.ts]
- **change_description:**
  > Extend the user repository contract so me, findById, and paginate-capable reads can compute block flags using the authenticated user id. Create the repository abstraction for block/unblock/list operations. Keep contracts framework-agnostic.
- **guardrails:** [build, import-check]
- **est_tokens:** ~1.5K

## Wave 1 — Domain [SEQUENTIAL]

**Agent:** NestJS Developer

### Task 1A: Create the blocked relation domain model

- **type:** CREATE
- **depends_on:** [0B]
- **files:**
  - src/domain/user-blocked/models/user-blocked.model.ts (new)
- **guardrails:** [build, import-check]
- **est_tokens:** ~0.6K

## Wave 2 — Infrastructure [PARALLEL]

**Agent:** NestJS Developer

### Task 2A: Create persistence entity for user-to-user blocking

- **type:** CREATE
- **depends_on:** [1A]
- **files:**
  - src/infrastructure/user-blocked/entities/user-blocked.entity.ts (new)
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~0.9K

### Task 2B: Create explicit mapper for blocked relation

- **type:** CREATE
- **depends_on:** [1A, 2A]
- **files:**
  - src/infrastructure/user-blocked/mappers/user-blocked.mapper.ts (new)
- **guardrails:** [build, import-check]
- **est_tokens:** ~0.6K

### Task 2C: Implement blocked relation repository

- **type:** CREATE
- **depends_on:** [0B, 1A, 2A, 2B]
- **files:**
  - src/infrastructure/user-blocked/user-blocked.repository.impl.ts (new)
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~1.7K

### Task 2D: Contextualize user infrastructure reads and expose block flags

- **type:** MODIFY
- **depends_on:** [0A, 0B, 2A]
- **files:**
  - src/infrastructure/user/entities/user.entity.ts (modify)
  - src/infrastructure/user/mappers/user.mapper.ts (modify)
  - src/infrastructure/user/user.repository.impl.ts (modify)
- **existing_context:**
  - **read_files:** [src/infrastructure/user/entities/user.entity.ts, src/infrastructure/user/mappers/user.mapper.ts, src/infrastructure/user/user.repository.impl.ts]
  - **read_interfaces:** [src/domain/user/user.repository.ts, src/domain/user/models/user.model.ts]
- **change_description:**
  > Add the persistence relation required to represent blocks and update repository queries so authenticated user aware reads can compute isBlockedByLogged and blockedLogged for me, get by id, paginate users, and blocked list responses. Preserve current user CRUD behavior outside these contextual reads.
- **guardrails:** [build, lint, import-check, flutter-contract-check]
- **est_tokens:** ~2.6K

## Wave 3 — Application [SEQUENTIAL]

**Agent:** NestJS Developer

### Task 3A: Implement user-blocked application service

- **type:** CREATE
- **depends_on:** [2C, 2D]
- **files:**
  - src/application/user-blocked/user-blocked.service.ts (new)
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~1.4K

### Task 3B: Adapt user application service to authenticated block-aware reads

- **type:** MODIFY
- **depends_on:** [2D]
- **files:**
  - src/application/user/user.service.ts (modify)
- **existing_context:**
  - **read_files:** [src/application/user/user.service.ts]
  - **read_interfaces:** [src/domain/user/user.repository.ts]
- **change_description:**
  > Thread authenticated user context into me, get by id, and paginated reads so the service returns users enriched with block flags. Do not move HTTP concerns into the service.
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~1.2K

## Wave 3T — Application Tests [PARALLEL]

**Agent:** NestJS Developer

### Task 3T-A: Add unit tests for user-blocked service flows

- **type:** CREATE
- **depends_on:** [3A]
- **files:**
  - src/application/user-blocked/user-blocked.service.spec.ts (new)
- **guardrails:** [unit-test, build]
- **est_tokens:** ~1.0K

### Task 3T-B: Add unit tests for contextual user service reads

- **type:** CREATE
- **depends_on:** [3B]
- **files:**
  - src/application/user/user.service.spec.ts (new)
- **guardrails:** [unit-test, build]
- **est_tokens:** ~1.0K

## Wave 4 — API [PARALLEL]

**Agent:** NestJS Developer

### Task 4A: Create authenticated user-blocked controller

- **type:** CREATE
- **depends_on:** [3A]
- **files:**
  - src/api/user-blocked/user-blocked.controller.ts (new)
- **guardrails:** [build, lint, swagger-contract-check, flutter-contract-check]
- **est_tokens:** ~1.6K

### Task 4B: Update user controller for authenticated flag-aware responses

- **type:** MODIFY
- **depends_on:** [3B]
- **files:**
  - src/api/user/user.controller.ts (modify)
- **existing_context:**
  - **read_files:** [src/api/user/user.controller.ts]
  - **read_interfaces:** [src/application/user/user.service.ts, src/domain/user/models/user.model.ts]
- **change_description:**
  > Pass the authenticated user into me, get by id, and paginate user reads. Enforce authentication on paginate users if needed to compute flags correctly. Keep controller thin and align Swagger with the actual payload including the two block flags.
- **guardrails:** [build, lint, swagger-contract-check, flutter-contract-check]
- **est_tokens:** ~1.3K

## Wave 4T — API Integration Tests [SEQUENTIAL]

**Agent:** NestJS Developer

### Task 4T-A: Add e2e coverage for blocking lifecycle and contextual user flags

- **type:** CREATE
- **depends_on:** [4A, 4B]
- **files:**
  - test/user-blocked.e2e-spec.ts (new)
- **guardrails:** [e2e-test, build]
- **est_tokens:** ~1.7K

## Wave 5 — Wiring [SEQUENTIAL]

**Agent:** NestJS Developer

### Task 5A: Wire the user-blocked module and repository providers

- **type:** CREATE
- **depends_on:** [2C, 3A, 4A]
- **files:**
  - src/api/user-blocked/user-blocked.module.ts (new)
- **guardrails:** [build, import-check]
- **est_tokens:** ~0.6K

### Task 5B: Register module imports and exports without breaking existing user feature

- **type:** MODIFY
- **depends_on:** [4B, 5A]
- **files:**
  - src/api/user/user.module.ts (modify)
  - src/app.module.ts (modify)
- **existing_context:**
  - **read_files:** [src/api/user/user.module.ts, src/app.module.ts]
- **change_description:**
  > Export or import only what is needed to resolve provider dependencies for user-blocked. Register UserBlockedModule in AppModule. Do not alter unrelated modules or shared providers.
- **guardrails:** [build, import-check]
- **est_tokens:** ~0.9K

## Wave R — Review

**Agent:** NestJS Reviewer

### Task R1: Review behavior, contracts, and regression surface

- **type:** REVIEW
- **depends_on:** [5B, 3T-A, 3T-B, 4T-A]
- **files:**
  - src/api/user-blocked/user-blocked.controller.ts (review)
  - src/application/user-blocked/user-blocked.service.ts (review)
  - src/infrastructure/user-blocked/user-blocked.repository.impl.ts (review)
  - src/api/user/user.controller.ts (review)
  - src/application/user/user.service.ts (review)
  - src/infrastructure/user/user.repository.impl.ts (review)
  - test/user-blocked.e2e-spec.ts (review)
- **guardrails:** [build, lint, unit-test, e2e-test, swagger-contract-check, flutter-contract-check]
- **est_tokens:** ~5.2K

## Wave ARCH — Architecture Validation

**Agent:** NestJS Architecture Validator

### Task ARCH-1: Validate clean architecture boundaries and alias compliance

- **type:** REVIEW
- **depends_on:** [R1]
- **files:**
  - src/api/user-blocked/user-blocked.module.ts (review)
  - src/api/user-blocked/user-blocked.controller.ts (review)
  - src/application/user-blocked/user-blocked.service.ts (review)
  - src/domain/user-blocked/user-blocked.repository.ts (review)
  - src/infrastructure/user-blocked/user-blocked.repository.impl.ts (review)
  - src/api/user/user.controller.ts (review)
  - src/application/user/user.service.ts (review)
  - src/domain/user/user.repository.ts (review)
- **guardrails:** [import-check, build, architecture-boundary-check]
- **est_tokens:** ~3.0K

## DAG Visual

0A -> 0B
0B -> 1A
1A -> 2A -> 2B -> 2C -> 3A -> 3T-A -> 4A -> 4T-A -> 5A
0A -> 2D
0B -> 2D
2D -> 3B -> 3T-B -> 4B -> 5B
4A -> 4T-A
4B -> 4T-A
5A -> 5B
3T-A -> R1
3T-B -> R1
4T-A -> R1
5B -> R1
R1 -> ARCH-1

## Cost Estimate

| Wave      | Tasks  | Type   | Est. Input Tokens | Est. Output Tokens |
| --------- | ------ | ------ | ----------------- | ------------------ |
| 0         | 2      | MIXED  | 3.2K              | 2.1K               |
| 1         | 1      | CREATE | 0.5K              | 0.6K               |
| 2         | 4      | MIXED  | 6.1K              | 4.7K               |
| 3         | 2      | MIXED  | 2.4K              | 2.6K               |
| 3T        | 2      | CREATE | 1.6K              | 1.4K               |
| 4         | 2      | MIXED  | 2.8K              | 2.9K               |
| 4T        | 1      | CREATE | 1.2K              | 1.1K               |
| 5         | 2      | MIXED  | 1.7K              | 1.0K               |
| R         | 1      | REVIEW | 5.0K              | 1.2K               |
| ARCH      | 1      | REVIEW | 3.0K              | 0.6K               |
| **Total** | **18** |        | **27.5K**         | **18.2K**          |

**Estimated total:** ~45.7K to ~52K tokens with execution overhead
**Context budget:** 2 conversations

## File Count Summary

- **CREATE:** 13
- **MODIFY:** 9
- **Total affected files:** 22

## Guardrails By Wave

- **Wave 0:** verify DTO/query contract against Flutter expectations, especially list shape for users/blocked/paginate.
- **Wave 2:** enforce unique blocker-blocked persistence rule and reject self-blocking in the persistence or application boundary.
- **Wave 3:** avoid HTTP decorators or request objects in services.
- **Wave 4:** Swagger must reflect authenticated endpoints and real response payloads.
- **Wave 5:** no circular provider graph between user and user-blocked modules.
- **Wave R / ARCH:** all imports must remain on project aliases, no TypeORM leakage into application or domain layers.

## Risks & Mitigations

| Risk                                                                                                         | Probability | Mitigation                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| users/blocked/paginate contract conflicts with the project PageDTO convention                                | High        | Lock the endpoint contract in Wave 0 and validate it again in Wave 4 and Review against Flutter's flat-array expectation.                           |
| Contextual flags require auth-aware reads on endpoints that are currently public, especially users/paginate  | High        | Promote users/paginate to authenticated flow in Wave 4B and thread logged user context from controller to repository through the application layer. |
| Adding blocked relations to user persistence can introduce circular TypeORM mappings or ambiguous joins      | Medium      | Isolate the join entity in user-blocked, keep joins explicit in repository code, and validate provider/entity wiring in Wave 5 and ARCH.            |
| Duplicate block rows or self-blocking can corrupt business semantics                                         | Medium      | Define uniqueness and self-block guardrails in Wave 2 and cover both cases in unit/e2e tests.                                                       |
| The current user model is used as both domain and API response shape, which can cause accidental regressions | Medium      | Keep new flags optional and review all affected user endpoints explicitly in Wave R.                                                                |
| Swagger may drift from actual payloads after contextual flag additions                                       | Medium      | Treat Swagger alignment as a required guardrail in Waves 0, 4, and R.                                                                               |

## Execution Notes For Orchestrator

- Start with Wave 0 before any repository or controller implementation so Flutter-facing contracts are frozen early.
- Do not parallelize tasks that modify the same file.
- Treat the blocked list endpoint as a separate contract from generic paginated user endpoints.
- Prefer one dedicated join entity for the blocked relation rather than overloading the user entity with ad hoc fields.
