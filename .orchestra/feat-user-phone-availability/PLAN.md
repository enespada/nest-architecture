# Plan: user phone availability

## Metadata

- **scope:** feature
- **topology:** pipeline
- **mode:** modify
- **stack:** nestjs + typeorm + class-validator + swagger
- **affected_modules:** [user]
- **template_used:** none
- **estimated_waves:** 4
- **estimated_tokens:** ~6.5K
- **conversation_budget:** 1
- **conversation_cuts:** []
- **guardrails:** [compile, lint, focused-e2e, import-check]
- **review_mode:** single
- **testing_mode:** adjacent

## Wave 0 — Contracts LITE

### Task 0A: Complete phone availability DTO contract

- **type:** MODIFY
- **depends_on:** none
- **files:**
  - src/application/user/dto/phone-availability-query.dto.ts (modify)
  - src/application/user/dto/phone-availability-response.dto.ts (modify)
- **change_description:**
  > Completar los DTOs ya existentes con validación class-validator y Swagger. El request debe modelar la combinación phonePreffix + phone y mantener el naming actual del dominio (phonePreffix).
- **guardrails:** [compile]
- **est_tokens:** ~0.8K

## Wave 1 — Domain + Infrastructure

### Task 1A: Extend repository contract for composite phone availability

- **type:** MODIFY
- **depends_on:** [0A]
- **files:**
  - src/domain/user/user.repository.ts (modify)
- **change_description:**
  > Añadir isPhoneAvailable(phonePreffix: string, phone: string): Promise<boolean> en la misma zona relativa que isUsernameAvailable e isEmailAvailable.
- **guardrails:** [compile, import-check]
- **est_tokens:** ~0.5K

### Task 1B: Implement composite availability query in TypeORM repository

- **type:** MODIFY
- **depends_on:** [1A]
- **files:**
  - src/infrastructure/user/user.repository.impl.ts (modify)
- **existing_context:**
  - **read_files:** [src/infrastructure/user/user.repository.impl.ts]
  - **read_interfaces:** [src/domain/user/user.repository.ts]
- **change_description:**
  > Replicar el patrón de isUsernameAvailable/isEmailAvailable, pero con count({ where: { phonePreffix, phone } }). Mantener el método en el mismo bloque relativo y no tocar otras consultas del repositorio.
- **guardrails:** [compile, lint]
- **est_tokens:** ~1.2K

## Wave 2 — Application + API

### Task 2A: Add application service orchestration

- **type:** MODIFY
- **depends_on:** [1B]
- **files:**
  - src/application/user/user.service.ts (modify)
- **change_description:**
  > Añadir isPhoneAvailable(phoneAvailabilityQueryDto) devolviendo { available }, igual que username/email. Mantener orden relativo de métodos entre capas.
- **guardrails:** [compile, lint, import-check]
- **est_tokens:** ~0.8K

### Task 2B: Expose GET /users/phone-available

- **type:** MODIFY
- **depends_on:** [2A]
- **files:**
  - src/api/user/user.controller.ts (modify)
- **existing_context:**
  - **read_files:** [src/api/user/user.controller.ts]
  - **read_interfaces:** [src/application/user/user.service.ts]
- **change_description:**
  > Añadir el endpoint fino siguiendo exactamente el patrón visual y funcional de username-available y email-available, con @ApiQuery, @ApiOkResponse, DTO de query y DTO de response.
- **guardrails:** [compile, lint]
- **est_tokens:** ~1.4K

## Wave 3 — Tests + Review

### Task 3A: Add focused e2e contract test

- **type:** CREATE
- **depends_on:** [2B]
- **files:**
  - test/user-phone-availability.e2e-spec.ts (new)
- **change_description:**
  > Crear un e2e de contrato mínimo para validar que el endpoint transforma y valida la query correctamente y delega al service con phonePreffix y phone. No añadir nuevos \*.spec.ts en src/.
- **guardrails:** [focused-e2e]
- **est_tokens:** ~1.3K

### Task 3B: Review and consistency check

- **type:** MODIFY
- **depends_on:** [3A]
- **files:**
  - src/api/user/user.controller.ts (modify)
  - src/application/user/user.service.ts (modify)
  - src/domain/user/user.repository.ts (modify)
  - src/infrastructure/user/user.repository.impl.ts (modify)
- **change_description:**
  > Verificar orden relativo del nuevo método entre capas, imports por alias, naming phonePreffix, y que la semántica de disponibilidad use la combinación exacta requerida.
- **guardrails:** [compile, lint, focused-e2e, import-check]
- **est_tokens:** ~0.5K

## DAG Visual

```text
0A -> 1A -> 1B -> 2A -> 2B -> 3A -> 3B
```

## Cost Estimate

| Wave      | Tasks | Type            | Est. Input Tokens | Est. Output Tokens |
| --------- | ----- | --------------- | ----------------- | ------------------ |
| 0         | 1     | MODIFY          | 0.4K              | 0.4K               |
| 1         | 2     | MODIFY          | 1.0K              | 0.7K               |
| 2         | 2     | MODIFY          | 1.2K              | 1.0K               |
| 3         | 2     | CREATE + MODIFY | 1.1K              | 0.7K               |
| **Total** | **7** |                 | **3.7K**          | **2.8K**           |

**Estimated total:** ~6.5K tokens
**Context budget:** 1 conversación

## Concrete Files

### Modify

- src/application/user/dto/phone-availability-query.dto.ts
- src/application/user/dto/phone-availability-response.dto.ts
- src/domain/user/user.repository.ts
- src/infrastructure/user/user.repository.impl.ts
- src/application/user/user.service.ts
- src/api/user/user.controller.ts

### Create

- test/user-phone-availability.e2e-spec.ts

## Risks & Mitigations

| Riesgo                                                           | Probabilidad | Mitigación                                                                                  |
| ---------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------------- |
| Semántica ambigua cuando falta phone o phonePreffix              | Media        | Forzar ambos campos en el DTO request con class-validator y cubrir caso inválido en el e2e. |
| Regresión por usar unicidad solo de phone                        | Media        | En repositorio, contar por { phonePreffix, phone } y revisar el contrato del método.        |
| Inconsistencia de orden entre controller/service/repository/impl | Baja         | Insertar el nuevo método justo después de isEmailAvailable en todas las capas.              |
| Error por typo del campo phonePreffix                            | Alta         | Mantener el nombre existente del modelo/DTO/entidad sin introducir phonePrefix.             |
