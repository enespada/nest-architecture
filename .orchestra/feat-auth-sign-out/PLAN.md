# Plan: auth sign-out

## Metadata

- **scope:** feature
- **topology:** dag-waves
- **mode:** mixed
- **stack:** nestjs + typeorm + passport-jwt + class-validator + swagger
- **affected_modules:** [auth (modify), auth-domain (new), auth-infrastructure (new)]
- **estimated_waves:** 10
- **estimated_tokens:** ~40K
- **context_window_reference:** 200K
- **context_budget_consumption:** ~20%
- **conversation_budget:** 2
- **conversation_cuts:** ["after Wave 3T", "after Wave 5"]
- **guardrails_default:** [build, lint, unit-test, e2e-test, import-check, swagger-contract-check]
- **review_mode:** eval-optimizer
- **planner_used_explorer:** no
- **context_file:** CONTEXT.md
- **create_modify_ratio:** CREATE:10 / MODIFY:4
- **template_used:** none

## Scope Summary

- **business_goal:** añadir POST /auth/sign-out para invalidar el refresh token recibido en body, autenticado con access token en Authorization, y dejar preparado el punto de integración para borrar el device session solo si ese módulo existe.
- **out_of_scope:**
  - invalidación global de access tokens ya emitidos mediante denylist en cada guard.
  - creación desde cero de una feature completa de session device en este repositorio.
- **assumptions:**
  - el endpoint devolverá 204 No Content en el camino feliz.
  - la revocación se aplicará al refresh token para bloquear futuros refresh; el access token se usa para autenticar la llamada de sign-out, no para persistir denylist salvo cambio de alcance.
  - si no existe módulo de session device, la limpieza de deviceId será un no-op controlado, no un error.

## Planning Inputs

- **architecture_reference:** .github/copilot-instructions.md + .github/instructions/clean-architecture.instructions.md + .github/instructions/api-and-dto.instructions.md + .github/instructions/testing.instructions.md
- **existing_contracts:**
  - src/api/auth/auth.controller.ts
  - src/application/auth/auth.service.ts
  - src/api/auth/dto/token.dto.ts
  - src/core/middlewares/jwt/refresh/jwt-refresh.strategy.ts
  - src/core/middlewares/jwt/user/jwt-user.strategy.ts
  - src/core/decorators/decorators.ts
- **existing_files_to_modify:**
  - src/api/auth/auth.controller.ts
  - src/application/auth/auth.service.ts
  - src/api/auth/auth.module.ts
  - src/core/decorators/decorators.ts
- **explore_artifacts_reviewed:** none

## Pre-Execution Checklist

- [x] DAG sin ciclos
- [x] Todas las dependencias referencian tareas existentes
- [x] Sin colision de ficheros en la misma wave
- [x] Tareas MODIFY apuntan a ficheros existentes
- [x] Guardrails definidos por wave
- [x] Cost estimate viable para el presupuesto de conversacion
- [x] CONTEXT.md disponible para el Orchestrator

---

## Wave 0 - Contracts [STANDARD]

> Contratos de entrada/salida y payload del caso de uso. No incluye persistencia.

### Task 0A: API sign-out request DTO

- **type:** CREATE
- **depends_on:** none
- **files:**
  - src/api/auth/dto/sign-out.dto.ts (new)
- **goal:** definir el body de POST /auth/sign-out con refreshToken y deviceId, validado con class-validator y documentado con Swagger.
- **guardrails:** [build, lint, swagger-contract-check]
- **est_input_tokens:** ~0.8K
- **est_output_tokens:** ~0.4K

### Task 0B: Application sign-out payload DTO

- **type:** CREATE
- **depends_on:** [0A]
- **files:**
  - src/application/auth/dto/sign-out-payload.dto.ts (new)
- **goal:** desacoplar el payload interno del request HTTP para que el service reciba userId, accessToken opcional, refreshToken y deviceId con un contrato explícito.
- **guardrails:** [build, import-check]
- **est_input_tokens:** ~0.8K
- **est_output_tokens:** ~0.4K

---

## Wave 1 - Domain [PARALLEL]

### Task 1A: Revoked refresh token model

- **type:** CREATE
- **depends_on:** [0B]
- **files:**
  - src/domain/auth/models/revoked-refresh-token.model.ts (new)
- **goal:** modelar la revocación mínima con campos orientados a seguridad y limpieza futura: tokenHash, userId, deviceId, revokedAt y expiresAt.
- **guardrails:** [build, import-check]
- **est_input_tokens:** ~0.9K
- **est_output_tokens:** ~0.5K

### Task 1B: Revocation repository and optional device cleanup port

- **type:** CREATE
- **depends_on:** [1A]
- **files:**
  - src/domain/auth/auth-refresh-token-repository.ts (new)
  - src/domain/auth/session-device-cleanup.port.ts (new)
- **goal:** definir el puerto de persistencia para revocar/consultar refresh tokens y un puerto opcional para eliminar el device session sin acoplar auth a un módulo inexistente hoy.
- **guardrails:** [build, import-check]
- **est_input_tokens:** ~1.2K
- **est_output_tokens:** ~0.8K

---

## Wave 2 - Infrastructure [PARALLEL]

### Task 2A: Revoked token persistence entity

- **type:** CREATE
- **depends_on:** [1A]
- **files:**
  - src/infrastructure/auth/entities/revoked-refresh-token.entity.ts (new)
- **goal:** añadir la entidad TypeORM para la revocación persistida, preparada para búsquedas por hash y limpieza por expiración.
- **guardrails:** [build, lint, import-check]
- **est_input_tokens:** ~1.0K
- **est_output_tokens:** ~0.7K

### Task 2B: Revoked token mapper

- **type:** CREATE
- **depends_on:** [1A, 2A]
- **files:**
  - src/infrastructure/auth/mappers/revoked-refresh-token.mapper.ts (new)
- **goal:** mantener el mapeo Entity <-> Domain explícito en la capa de infraestructura.
- **guardrails:** [build, import-check]
- **est_input_tokens:** ~0.7K
- **est_output_tokens:** ~0.5K

### Task 2C: Revocation repository implementation

- **type:** CREATE
- **depends_on:** [1B, 2A, 2B]
- **files:**
  - src/infrastructure/auth/auth-refresh-token.repository.impl.ts (new)
- **goal:** implementar la escritura y consulta de revocación usando hash del refresh token, sin almacenar el token plano si no es imprescindible.
- **guardrails:** [build, lint, import-check]
- **est_input_tokens:** ~1.5K
- **est_output_tokens:** ~1.2K

---

## Wave 3 - Application [SEQUENTIAL]

### Task 3A: Extend AuthService with sign-out and refresh revocation enforcement

- **type:** MODIFY
- **depends_on:** [0B, 1B, 2C]
- **files:**
  - src/application/auth/auth.service.ts (modify)
- **goal:** añadir el caso de uso signOut y hacer que refresh rechace refresh tokens revocados antes de emitir nuevos tokens.
- **existing_context:**
  - **read_files:**
    - src/application/auth/auth.service.ts
  - **read_interfaces:**
    - src/domain/auth/auth-refresh-token-repository.ts
    - src/domain/auth/session-device-cleanup.port.ts
- **change_description:**
  - añadir un flujo signOut que persista la revocación del refresh token y ejecute la limpieza de deviceId solo si existe un collaborator opcional.
  - mantener login y register sin cambios de comportamiento.
  - reforzar refresh con consulta al repositorio de revocación; no mover validación HTTP al service.
- **guardrails:** [build, lint, import-check]
- **est_input_tokens:** ~1.8K
- **est_output_tokens:** ~1.1K

---

## Wave 3T - Unit Tests [PARALLEL]

### Task 3T-A: AuthService unit coverage for sign-out

- **type:** TEST
- **depends_on:** [3A]
- **files:**
  - src/application/auth/auth.service.spec.ts (new)
- **goal:** cubrir revocación exitosa, comportamiento idempotente razonable, rechazo de refresh revocado y ejecución opcional del cleanup de device session.
- **guardrails:** [unit-test, build]
- **est_input_tokens:** ~1.5K
- **est_output_tokens:** ~1.1K

---

## Wave 4 - API [SEQUENTIAL]

### Task 4A: Add POST /auth/sign-out controller endpoint

- **type:** MODIFY
- **depends_on:** [0A, 3A]
- **files:**
  - src/api/auth/auth.controller.ts (modify)
- **goal:** exponer POST /auth/sign-out con ApiBearerAuth, JwtUserGuard, request DTO y delegación al AuthService.
- **existing_context:**
  - **read_files:**
    - src/api/auth/auth.controller.ts
  - **read_interfaces:**
    - src/application/auth/auth.service.ts
    - src/api/auth/dto/sign-out.dto.ts
- **change_description:**
  - añadir el bloque POST sign-out respetando el estilo de separadores del proyecto.
  - documentar que Authorization debe contener access token y que el body requiere refreshToken y deviceId.
  - mantener refresh como endpoint separado.
- **guardrails:** [build, lint, swagger-contract-check]
- **est_input_tokens:** ~1.3K
- **est_output_tokens:** ~0.8K

### Task 4B: Fix raw token extraction for refresh/sign-out flows

- **type:** MODIFY
- **depends_on:** [3A]
- **files:**
  - src/core/decorators/decorators.ts (modify)
- **goal:** asegurar que el decorator que lee el token use request.token, ya que las estrategias JWT actuales escriben el raw token en ese campo y no en request.user.token.
- **existing_context:**
  - **read_files:**
    - src/core/decorators/decorators.ts
    - src/core/middlewares/jwt/user/jwt-user.strategy.ts
    - src/core/middlewares/jwt/refresh/jwt-refresh.strategy.ts
- **change_description:**
  - corregir la lectura del token bruto sin cambiar el contrato de UserToken ni de DecodedToken.
  - preservar compatibilidad hacia atrás con cualquier ruta que aún lea request.user.token.
- **guardrails:** [build, import-check]
- **est_input_tokens:** ~1.0K
- **est_output_tokens:** ~0.5K

---

## Wave 4T - API Integration Tests [SEQUENTIAL]

### Task 4T-A: Auth sign-out endpoint integration coverage

- **type:** TEST
- **depends_on:** [4A, 4B]
- **files:**
  - test/auth-sign-out.e2e-spec.ts (new)
- **goal:** validar 204 happy path, 401 sin Authorization, 400 body inválido y que el controller delega al service con user/token/body correctos usando un TestingModule acotado.
- **guardrails:** [e2e-test, build]
- **est_input_tokens:** ~1.8K
- **est_output_tokens:** ~1.3K

---

## Wave 5 - Wiring [SEQUENTIAL]

### Task 5A: Wire auth persistence and optional device cleanup hook

- **type:** MODIFY
- **depends_on:** [2C, 3A, 4A, 4B]
- **files:**
  - src/api/auth/auth.module.ts (modify)
- **goal:** registrar la entidad de revocación y el repositorio en AuthModule, e inyectar de forma opcional un collaborator de session-device sin exigir que exista el módulo hoy.
- **existing_context:**
  - **read_files:**
    - src/api/auth/auth.module.ts
- **change_description:**
  - añadir TypeOrmModule.forFeature y el provider del repositorio de revocación.
  - preparar un token de provider opcional para cleanup de device session; si no existe implementación exportada por otro módulo, auth debe seguir compilando y funcionando.
  - no tocar AppModule salvo que durante la ejecución aparezca una dependencia nueva real.
- **guardrails:** [build, lint, import-check]
- **est_input_tokens:** ~1.3K
- **est_output_tokens:** ~0.8K

### Task 5B: Conditional device-session integration branch

- **type:** MODIFY
- **depends_on:** [5A]
- **files:**
  - src/api/auth/auth.module.ts (modify, conditional)
  - src/api/<session-device>/<session-device>.module.ts (modify, conditional)
- **goal:** solo si durante la ejecución aparece un módulo real de session device, enlazar su provider/export para que sign-out borre userId + deviceId.
- **existing_context:**
  - **read_files:** []
- **change_description:**
  - no crear esta feature desde cero como parte del alcance mínimo.
  - ejecutar esta tarea únicamente si el repo ya contiene el módulo antes del wave de wiring.
- **guardrails:** [build, import-check]
- **est_input_tokens:** ~0.6K
- **est_output_tokens:** ~0.4K

---

## Wave R - Review [EVAL-OPTIMIZER]

- **max_iterations:** 2
- **auto_fix_severity:** HIGH
- **review_scopes:**
  - auth controller/service coherence
  - revocation persistence semantics
  - optional dependency behavior when session-device is absent
  - DTO validation and Swagger accuracy
- **focus:**
  - naming
  - consistency
  - imports
  - anti-patterns
  - regression risk

---

## Wave ARCH - Architecture Validation [SINGLE]

- **reference:** .github/instructions/clean-architecture.instructions.md
- **validates:**
  - allowed dependencies
  - layer boundaries
  - repository token usage
  - no TypeORM leakage into controller/application
  - optional collaborator remains behind a port/token

## DAG Visual

```text
[0A] -> [0B] -> [1A] -> [1B] -> [2A] -> [2B] -> [2C] -> [3A] -> [3T-A]
                                                     \-> [4A] -> [4T-A]
                                              [3A] -> [4B] -----^
[2C] -----------------------------------------------> [5A] -> [5B?] -> [R] -> [ARCH]
[4A] -----------------------------------------------> [5A]
[4B] -----------------------------------------------> [5A]
[3T-A] ---------------------------------------------> [R]
[4T-A] ---------------------------------------------> [R]
```

## Cost Estimate

| Wave      | Tasks  | Type       | Est. Input Tokens | Est. Output Tokens | Est. Total |
| --------- | ------ | ---------- | ----------------- | ------------------ | ---------- |
| 0         | 2      | CONTRACT   | 1.6K              | 0.8K               | 2.4K       |
| 1         | 2      | CREATE     | 2.1K              | 1.3K               | 3.4K       |
| 2         | 3      | CREATE     | 3.2K              | 2.4K               | 5.6K       |
| 3         | 1      | MODIFY     | 1.8K              | 1.1K               | 2.9K       |
| 3T        | 1      | TEST       | 1.5K              | 1.1K               | 2.6K       |
| 4         | 2      | MODIFY     | 2.3K              | 1.3K               | 3.6K       |
| 4T        | 1      | TEST       | 1.8K              | 1.3K               | 3.1K       |
| 5         | 2      | MODIFY     | 1.9K              | 1.2K               | 3.1K       |
| R         | 1      | REVIEW     | 4.0K              | 1.5K               | 5.5K       |
| ARCH      | 1      | VALIDATION | 2.0K              | 0.6K               | 2.6K       |
| **Total** | **15** |            | **22.2K**         | **12.6K**          | **34.8K**  |

- **fit_assessment:** entra en 2 conversaciones con corte natural tras tests de aplicación o tras wiring.

## Risks and Mitigations

| Riesgo                                                                                                 | Probabilidad | Impacto | Mitigacion                                                                                |
| ------------------------------------------------------------------------------------------------------ | ------------ | ------- | ----------------------------------------------------------------------------------------- |
| El decorator Token hoy parece leer request.user.token, pero las estrategias JWT escriben request.token | High         | High    | Incluir corrección explícita en Wave 4B antes de cerrar refresh/sign-out                  |
| No existe módulo session-device en el repo actual                                                      | High         | Medium  | Tratar cleanup como collaborator opcional y dejar la rama de integración como condicional |
| Si se almacena el refresh token en claro, aumenta la exposición de credenciales                        | Medium       | High    | Persistir hash del token y metadatos mínimos, no el JWT plano                             |
| La revocación solo cubrirá refresh y no access tokens ya emitidos                                      | High         | Medium  | Declararlo fuera de alcance mínimo; ampliar a denylist global solo si producto lo pide    |
| No hay patrón auth e2e consolidado en el repo                                                          | Medium       | Medium  | Usar TestingModule acotado con guard override para pruebas del controller                 |

## Conversation Handoff Notes

- **next_cut_after:** Wave 3T
- **handoff_packet_must_include:**
  - decisión final sobre persistir hash vs token plano
  - token/provider elegido para SessionDeviceCleanupPort
  - paths creados/modificados
  - resultados de build, unit-test y e2e-test
