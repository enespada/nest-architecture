# CONTEXT: auth sign-out

## Decisiones de planificación derivadas del análisis

- El stack detectado es NestJS con Clean Architecture real en src/api, src/application, src/domain y src/infrastructure, usando TypeORM, Passport JWT, class-validator y Swagger.
- Auth hoy es esencialmente stateless: login genera access/refresh, refresh acepta un refresh token válido y no existe persistencia para invalidarlo después.
- El frontend Flutter ya envía exactamente el contrato pedido para logout: access token en Authorization y refreshToken + deviceId en body. La feature backend puede alinearse con ese contrato sin renegociar API.
- No se ha detectado ningún módulo funcional de session device en src/api, src/application, src/domain ni src/infrastructure. La planificación mínima no debe inventar ese módulo; debe degradar de forma segura cuando no exista.
- AppModule ya importa AuthModule. El wiring esperado se concentra en AuthModule; no hay evidencia de que haga falta tocar AppModule para esta feature.

## Hallazgos técnicos relevantes para Workers

- El raw JWT se guarda hoy en request.token dentro de JwtUserStrategy y JwtRefreshStrategy.
- El decorator Token actual devuelve request.user.token, no request.token. Ese desacople es un defecto local que impide depender con seguridad del token bruto en refresh/sign-out.
- La forma de validar un refresh revocado con el menor alcance es hacerlo dentro de AuthService.refresh, antes de emitir nuevos tokens, en lugar de abrir un refactor mayor sobre JwtRefreshStrategy.
- La persistencia mínima recomendada para revocación es una tabla de revoked refresh tokens con hash del token, userId, deviceId, revokedAt y expiresAt. Con el stack actual no existe un jti previo en el JWT, así que el hash del token crudo es la opción más directa.
- Si en el futuro aparece un módulo de session device, la integración correcta es mediante un puerto/proveedor opcional exportado por ese módulo, no acoplando AuthService directamente a infraestructura ajena.

## Convenciones relevantes para Workers

- Mantener controllers thin: validación, Swagger, guards y delegación al service.
- Mantener los puertos en domain y la persistencia concreta en infrastructure.
- Reutilizar path aliases del proyecto: @application, @domain, @infrastructure, @controller, @core, @environments.
- Mantener el estilo de separadores en controllers para el nuevo POST sign-out.
- Escribir comentarios nuevos en inglés únicamente.

## Riesgos activos a monitorear durante la ejecución

- Si se decide invalidar también access tokens, el alcance deja de ser mínimo y probablemente exige tocar guards/strategies de forma más amplia.
- El collaborator opcional para session-device puede introducir wiring frágil si no se resuelve con un token/proveedor claro y opcional.
- La ausencia de fixtures auth e2e obliga a usar un TestingModule acotado o a preparar setup adicional de DB; eso afecta tiempo, no viabilidad.

## Descartado del análisis

- No hay evidencia de una feature reutilizable de logout, revoke token, blacklist o device session en el backend actual.
- No hay templates de PLAN.md específicos dentro del repositorio nest-architecture; se usa el formato estándar del sistema .orchestra.
- No hace falta crear una feature nueva completa fuera de auth para cumplir el alcance mínimo solicitado.
