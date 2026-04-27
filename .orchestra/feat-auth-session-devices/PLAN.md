# Plan: auth session devices

## Metadata

- **scope:** module
- **topology:** dag-waves
- **mode:** mixed
- **stack:** nestjs + typeorm + passport-jwt + class-validator + swagger
- **affected_modules:** [auth (modify), core-jwt (validate), repo-ai-docs (modify)]
- **estimated_waves:** 10
- **estimated_tokens:** ~45K
- **conversation_budget:** 2
- **conversation_cuts:** ["after Wave 2", "after Wave 4T"]
- **guardrails:** [build, lint, unit-test, e2e-test, import-check]
- **review_mode:** eval-optimizer
- **testing_mode:** adjacent
- **planner_used_explorer:** yes
- **context_file:** CONTEXT.md
- **template_used:** none
- **create_modify_ratio:** CREATE:7 / MODIFY:15 (incluye retirements)

## Scope Summary

- **business_goal:** reemplazar por completo la invalidación basada en RevokedRefreshToken por una persistencia real de SessionDevice, manteniendo el feature dentro del módulo auth y eliminando el cleanup port anterior.
- **out_of_scope:**
  - rotación completa de refresh tokens con cambio de contrato externo distinto del actual, salvo que se detecte como requisito implícito durante la ejecución.
  - creación de un módulo transversal independiente de session devices fuera de auth.
  - cambios cosméticos o refactors ajenos a auth, tests y documentación IA.
- **assumptions:**
  - el login deberá aceptar metadata de dispositivo suficiente para construir o actualizar un SessionDevice: deviceId, sessionDeviceType y name.
  - el refresh seguirá autenticado por JwtRefreshGuard y el control de existencia del SessionDevice se resolverá en AuthService usando el refresh token bruto recibido.
  - la entidad SessionDevice no incluirá endpointArn mientras no exista un caso real en este proyecto.
  - AuthModule seguirá siendo el punto de wiring; no se prevé tocar AppModule.

## Planning Inputs

- **architecture_reference:** .github/copilot-instructions.md + .github/instructions/clean-architecture.instructions.md + .github/instructions/api-and-dto.instructions.md + .github/instructions/testing.instructions.md + .github/skills/nest-clean-feature/SKILL.md
- **existing_contracts:**
  - src/api/auth/auth.controller.ts
  - src/api/auth/auth.module.ts
  - src/api/auth/dto/login.dto.ts
  - src/api/auth/dto/sign-out.dto.ts
  - src/application/auth/auth.service.ts
  - src/application/auth/auth.service.spec.ts
  - src/application/auth/dto/login-response.dto.ts
  - src/domain/auth/auth.repository.ts
  - src/core/decorators/decorators.ts
  - src/core/middlewares/jwt/refresh/jwt-refresh.strategy.ts
  - src/core/middlewares/jwt/user/jwt-user.strategy.ts
- **existing_files_to_replace_or_remove:**
  - src/domain/auth/auth-refresh-token.repository.ts
  - src/domain/auth/models/revoked-refresh-token.model.ts
  - src/domain/auth/session-device-cleanup.port.ts
  - src/infrastructure/auth/auth-refresh-token.repository.impl.ts
  - src/infrastructure/auth/entities/revoked-refresh-token.entity.ts
  - src/infrastructure/auth/mappers/revoked-refresh-token.mapper.ts
  - src/application/auth/dto/user-token.dto.ts
- **guardrails_commands:**
  - build: npm run build
  - lint: npm run lint
  - unit-auth: npm test -- --runTestsByPath src/application/auth/auth.service.spec.ts
  - e2e-auth: npm run test:e2e -- --runTestsByPath test/auth-sign-out.e2e-spec.ts test/auth-refresh.e2e-spec.ts
  - import-check: npm run build

## Pre-Execution Checklist

- [x] DAG sin ciclos
- [x] Todas las dependencias referencian tareas existentes
- [x] Sin colisión de ficheros en la misma wave
- [x] Tareas MODIFY apuntan a ficheros existentes
- [x] Guardrails ejecutables definidos
- [x] Cost estimate compatible con 2 conversaciones
- [x] CONTEXT.md requerido por el Orchestrator

---

## Wave 0 - Contracts [STANDARD]

> Contratos de entrada y payloads internos. Se separa porque alimenta tanto application como infrastructure y además corrige el contrato de servicio pedido por el usuario.

### Task 0A: Expand API auth DTOs for device-aware login/sign-out

- **type:** MODIFY
- **depends_on:** none
- **files:**
  - src/api/auth/dto/login.dto.ts (modify)
  - src/api/auth/dto/sign-out.dto.ts (modify)
- **goal:** ampliar el contrato HTTP para que login aporte deviceId, sessionDeviceType y name, y dejar sign-out con validación explícita del dispositivo objetivo sin introducir endpointArn.
- **guardrails:** [build, lint]
- **est_tokens:** ~2.4K

### Task 0B: Add application input DTOs and repository payload DTOs

- **type:** CREATE
- **depends_on:** [0A]
- **files:**
  - src/application/auth/dto/login-input.dto.ts (new)
  - src/application/auth/dto/sign-out-input.dto.ts (new)
  - src/application/auth/dto/upsert-session-device-payload.dto.ts (new)
  - src/application/auth/dto/delete-session-device-payload.dto.ts (new)
- **goal:** hacer que AuthService reciba DTOs normales o parámetros agrupados y que los payload DTOs queden restringidos al contrato de repositorio, conforme a la corrección de estilo del usuario.
- **guardrails:** [build, import-check]
- **est_tokens:** ~2.2K

### Task 0C: Retire stale response alias DTO

- **type:** MODIFY
- **depends_on:** none
- **files:**
  - src/application/auth/dto/user-token.dto.ts (modify -> retire)
- **goal:** retirar el alias antiguo UserTokenDTO para consolidar LoginResponseDto como respuesta única del caso de uso.
- **guardrails:** [build]
- **est_tokens:** ~0.8K

---

## Wave 1 - Domain [PARALLEL]

### Task 1A: Create SessionDevice domain model

- **type:** CREATE
- **depends_on:** [0B]
- **files:**
  - src/domain/auth/models/session-device.model.ts (new)
- **goal:** modelar SessionDevice con userId, deviceId, sessionDeviceType, name, accessToken y refreshToken, preparado para login, refresh y sign-out.
- **guardrails:** [build, import-check]
- **est_tokens:** ~0.8K

### Task 1B: Reshape AuthRepository and remove revoked-token domain leftovers

- **type:** MODIFY
- **depends_on:** [0B, 1A, 0C]
- **files:**
  - src/domain/auth/auth.repository.ts (modify)
  - src/domain/auth/auth-refresh-token.repository.ts (modify -> retire)
  - src/domain/auth/models/revoked-refresh-token.model.ts (modify -> retire)
  - src/domain/auth/session-device-cleanup.port.ts (modify -> retire)
- **goal:** redefinir AuthRepository alrededor de SessionDevice con operaciones de upsert, búsqueda por refresh token y borrado por usuario/dispositivo, eliminando por completo el cleanup port y los contratos de revoked refresh token.
- **guardrails:** [build, import-check]
- **est_tokens:** ~2.0K

---

## Wave 2 - Infrastructure [PARALLEL]

### Task 2A: Create SessionDevice persistence artifacts

- **type:** CREATE
- **depends_on:** [1A, 1B]
- **files:**
  - src/infrastructure/auth/entities/session-device.entity.ts (new)
  - src/infrastructure/auth/mappers/session-device.mapper.ts (new)
- **goal:** añadir la entidad TypeORM y el mapper explícito Entity <-> Domain para SessionDevice, sin endpointArn y con índices/uniques acordes al lookup por usuario/dispositivo y refresh token.
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~2.3K

### Task 2B: Reimplement AuthRepositoryImpl on top of SessionDevice

- **type:** MODIFY
- **depends_on:** [2A, 1B]
- **files:**
  - src/infrastructure/auth/auth.repository.impl.ts (modify)
- **goal:** sustituir la lógica de revoked tokens por persistencia real de SessionDevice: upsert para login/refresh, lookup por refresh token y delete para sign-out, con tipado explícito en variables locales y retornos.
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~1.9K

### Task 2C: Remove revoked-token persistence leftovers

- **type:** MODIFY
- **depends_on:** [2B]
- **files:**
  - src/infrastructure/auth/auth-refresh-token.repository.impl.ts (modify -> retire)
  - src/infrastructure/auth/entities/revoked-refresh-token.entity.ts (modify -> retire)
  - src/infrastructure/auth/mappers/revoked-refresh-token.mapper.ts (modify -> retire)
- **goal:** retirar la implementación duplicada o residual de revoked refresh tokens para evitar coexistencia de dos estrategias de persistencia incompatibles.
- **guardrails:** [build, lint]
- **est_tokens:** ~1.1K

---

## Wave 3 - Application [SEQUENTIAL]

### Task 3A: Reimplement AuthService with grouped inputs and SessionDevice orchestration

- **type:** MODIFY
- **depends_on:** [0B, 1B, 2B]
- **files:**
  - src/application/auth/auth.service.ts (modify)
- **existing_context:**
  - **read_files:**
    - src/application/auth/auth.service.ts
    - src/application/auth/dto/login-response.dto.ts
  - **read_interfaces:**
    - src/domain/auth/auth.repository.ts
    - src/application/auth/dto/login-input.dto.ts
    - src/application/auth/dto/sign-out-input.dto.ts
- **change_description:**
  > Reescribir login para recibir un DTO agrupado, autenticar, generar tokens y registrar o actualizar SessionDevice. Reescribir signOut para construir el payload del repositorio desde parámetros agrupados y borrar el SessionDevice del dispositivo autenticado. Reescribir refresh para comprobar existencia del SessionDevice por refresh token antes de emitir un nuevo access token, manteniendo el guard JWT como validación de expiración. Eliminar cualquier dependencia de RevokedRefreshToken y del cleanup port.
- **guardrails:** [build, lint, import-check]
- **est_tokens:** ~3.0K

---

## Wave 3T - Unit Tests [SEQUENTIAL]

### Task 3T-A: Refresh AuthService unit coverage around SessionDevice lifecycle

- **type:** MODIFY
- **depends_on:** [3A]
- **files:**
  - src/application/auth/auth.service.spec.ts (modify)
- **goal:** cubrir login con upsert de SessionDevice, refresh permitido solo cuando existe SessionDevice, rechazo si no existe, y sign-out borrando la sesión correcta; eliminar expectativas y fixtures basadas en revoked refresh tokens.
- **guardrails:** [unit-test, build]
- **est_tokens:** ~2.4K

---

## Wave 4 - API [SEQUENTIAL]

### Task 4A: Align AuthController with the new service contracts

- **type:** MODIFY
- **depends_on:** [0A, 3A]
- **files:**
  - src/api/auth/auth.controller.ts (modify)
- **existing_context:**
  - **read_files:**
    - src/api/auth/auth.controller.ts
    - src/api/auth/dto/login.dto.ts
    - src/api/auth/dto/sign-out.dto.ts
  - **read_interfaces:**
    - src/application/auth/auth.service.ts
- **change_description:**
  > Adaptar login para delegar un DTO agrupado y sign-out para delegar userId, accessToken y signOutDto agrupado, manteniendo el estilo de separadores del controller y la documentación Swagger. No ampliar controllers con lógica de negocio.
- **guardrails:** [build, lint]
- **est_tokens:** ~1.7K

---

## Wave 4T - API Tests [PARALLEL]

### Task 4T-A: Update sign-out e2e contract coverage

- **type:** MODIFY
- **depends_on:** [4A]
- **files:**
  - test/auth-sign-out.e2e-spec.ts (modify)
- **goal:** ajustar las expectativas al nuevo contrato de servicio agrupado y garantizar que sign-out sigue borrando la sesión del dispositivo autenticado sin depender de revoked tokens.
- **guardrails:** [e2e-test, build]
- **est_tokens:** ~1.7K

### Task 4T-B: Add refresh e2e coverage for SessionDevice existence checks

- **type:** CREATE
- **depends_on:** [4A, 3A]
- **files:**
  - test/auth-refresh.e2e-spec.ts (new)
- **goal:** validar que refresh responde de forma coherente cuando el refresh token existe en SessionDevice y cuando no existe, sin desplazar la validación de expiración fuera del guard JWT.
- **guardrails:** [e2e-test, build]
- **est_tokens:** ~2.0K

---

## Wave 5 - Wiring + Docs [SEQUENTIAL]

### Task 5A: Rewire AuthModule to SessionDevice persistence

- **type:** MODIFY
- **depends_on:** [2A, 2B, 2C, 4A]
- **files:**
  - src/api/auth/auth.module.ts (modify)
- **goal:** registrar SessionDeviceEntity en TypeOrmModule, mantener el provider token AuthRepository y eliminar el wiring que aún apunta a RevokedRefreshTokenEntity.
- **guardrails:** [build, lint]
- **est_tokens:** ~1.1K

### Task 5B: Update AI repository documentation with the corrected style rules

- **type:** MODIFY
- **depends_on:** none
- **files:**
  - .github/copilot-instructions.md (modify)
- **goal:** documentar de forma explícita que los application services deben recibir DTOs normales o parámetros agrupados, que los payload DTOs pertenecen al contrato de repositorio, que debe preferirse tipado explícito en variables locales y retornos, y que las correcciones de estilo/programación del usuario deben anotarse en esta documentación.
- **guardrails:** [lint]
- **est_tokens:** ~1.0K

---

## Wave R - Review [SEQUENTIAL]

### Task R1: Remove residual references and normalize auth terminology

- **type:** MODIFY
- **depends_on:** [3T-A, 4T-A, 4T-B, 5A, 5B]
- **files:**
  - src/application/auth/auth.service.ts (modify if needed)
  - src/application/auth/auth.service.spec.ts (modify if needed)
  - src/domain/auth/auth.repository.ts (modify if needed)
  - src/infrastructure/auth/auth.repository.impl.ts (modify if needed)
  - src/api/auth/auth.controller.ts (modify if needed)
  - src/api/auth/auth.module.ts (modify if needed)
- **goal:** resolver residuos de nomenclatura anterior, imports huérfanos, referencias a revoked tokens, y asegurar consistencia final entre DTOs, contrato del service y repositorio.
- **guardrails:** [build, lint, unit-test, e2e-test]
- **est_tokens:** ~3.1K

---

## Wave ARCH - Architecture Validation [SEQUENTIAL]

### Task ARCH1: Validate layer boundaries and necessity of JWT strategy changes

- **type:** MODIFY
- **depends_on:** [R1]
- **files:**
  - src/core/middlewares/jwt/refresh/jwt-refresh.strategy.ts (validate; modify only if token propagation breaks)
  - src/core/middlewares/jwt/user/jwt-user.strategy.ts (validate; modify only if token propagation breaks)
  - src/core/decorators/decorators.ts (validate; modify only if token propagation breaks)
- **goal:** confirmar que el nuevo flujo sigue controlado por AuthService, que las strategies no absorben lógica de negocio y que el raw token sigue llegando correctamente al service. Si no hace falta tocar estos ficheros, cerrar la wave sin cambios.
- **guardrails:** [build, lint, unit-test, e2e-test, import-check]
- **est_tokens:** ~1.4K

---

## DAG Visual

0A -> 0B -> 1A -> 1B -> 2A -> 2B -> 2C -> 3A -> 3T-A -> 4A -> 4T-A -> 5A -> R1 -> ARCH1
0A -> 4A
0C -> 1B
3A -> 4T-B
5B -> R1
4A -> 4T-B

## Cost Estimate

| Wave      | Tasks  | Type            | Est. Input Tokens | Est. Output Tokens |
| --------- | ------ | --------------- | ----------------- | ------------------ |
| 0         | 3      | MIXED           | 3.0K              | 2.4K               |
| 1         | 2      | MIXED           | 2.3K              | 1.3K               |
| 2         | 3      | MIXED           | 3.2K              | 2.1K               |
| 3         | 1      | MODIFY          | 2.0K              | 1.0K               |
| 3T        | 1      | MODIFY          | 1.5K              | 0.9K               |
| 4         | 1      | MODIFY          | 1.3K              | 0.7K               |
| 4T        | 2      | MIXED           | 2.1K              | 1.6K               |
| 5         | 2      | MODIFY          | 1.4K              | 0.7K               |
| R         | 1      | MODIFY          | 1.8K              | 0.8K               |
| ARCH      | 1      | MODIFY/VALIDATE | 0.8K              | 0.4K               |
| **Total** | **17** |                 | **19.4K**         | **11.9K**          |

**Estimated total:** ~31K direct execution tokens
**Planner overhead + review buffers:** ~14K
**Grand total estimate:** ~45K tokens
**Context budget:** 2 conversaciones

## Risks & Mitigations

| Riesgo                                                                                                                  | Probabilidad | Mitigación                                                                                                           |
| ----------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------- |
| El contrato de login actual no incluye metadata de dispositivo y exige coordinación con cliente externo                 | Alta         | Cerrar Wave 0 primero y validar el contrato antes de tocar service o tests                                           |
| Ambigüedad sobre si refresh debe rotar o no el refresh token almacenado en SessionDevice                                | Media        | Preservar la semántica actual salvo decisión explícita del usuario durante la ejecución                              |
| Persistir accessToken y refreshToken en SessionDevice puede requerir decidir entre valor plano, hash o estrategia mixta | Media        | Resolverlo en Wave 2 con una decisión documentada en CONTEXT y mantener lookup compatible con el requisito funcional |
| Los restos de la implementación anterior están parcialmente rotos y pueden contaminar imports o wiring                  | Alta         | Hacer retirements explícitos en Waves 1 y 2, y usar Wave R para limpieza residual                                    |
| Cambios innecesarios en strategies podrían desplazar lógica de negocio fuera de application                             | Baja         | Tratar strategies como validación de arquitectura en Wave ARCH y modificarlas solo si el paso del raw token falla    |
