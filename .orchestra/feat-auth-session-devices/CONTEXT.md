# CONTEXT: auth session devices

## Decisiones de planificación derivadas del análisis

- El stack real es NestJS con Clean Architecture en src/api, src/application, src/domain y src/infrastructure, usando TypeORM, Passport JWT, class-validator y Swagger.
- El estado actual ya refleja parte del renombrado pedido: AuthRepository y LoginResponseDto existen y son el punto de continuidad correcto. También siguen presentes artefactos viejos o residuales como AuthRefreshTokenRepository, RevokedRefreshToken y UserTokenDTO, por lo que el plan debe asumir coexistencia temporal y retirarla explícitamente.
- AuthModule ya concentra el wiring de auth y registra hoy RevokedRefreshTokenEntity. No hay indicios de que AppModule deba tocarse para esta reimplementación.
- JwtRefreshStrategy y JwtUserStrategy ya dejan el raw token en request.token, y el decorator Token ya hace fallback a request.token. Por tanto, el punto de control previsto para refresh y sign-out sigue siendo AuthService, no las strategies.
- LoginDTO actual solo recibe email y password. Para crear o actualizar SessionDevice conforme al nuevo alcance, el contrato HTTP deberá ampliarse con metadata de dispositivo suficiente: deviceId, sessionDeviceType y name.
- No existe una feature previa de SessionDevice en el backend. La implementación debe quedarse dentro de auth y no inventar un módulo transversal nuevo salvo cambio de alcance posterior.

## Convenciones relevantes para Workers

- Mantener controllers thin: guards, Swagger, request DTOs y delegación al service; no mover lógica de negocio al controller.
- Mantener AuthService como orquestador: recibe DTOs normales o parámetros agrupados; construye payload DTOs al invocar AuthRepository.
- Los \*-payload.dto.ts pertenecen al contrato de repositorio y a su implementación, no a la firma pública de los application services.
- Usar imports con aliases del proyecto: @application, @domain, @infrastructure, @core, @controller, @environments.
- En código tocado, preferir tipado explícito en variables locales y retornos de métodos.
- La documentación IA del repo debe actualizarse cuando el usuario corrija estilo o programación para evitar repetir el error.

## Riesgos activos a monitorear durante la ejecución

- Hay una ambigüedad funcional no bloqueante sobre si refresh debe mantener el mismo refresh token o rotarlo al refrescar. El plan preserva la semántica actual salvo instrucción adicional del usuario.
- Persistir accessToken y refreshToken en SessionDevice abre la decisión de almacenamiento plano frente a hash. El requisito funcional exige lookup por refresh token existente; cualquier endurecimiento de seguridad deberá seguir cumpliendo ese lookup.
- Como el login actual no pide metadata de dispositivo, cualquier consumidor externo que no envíe esos campos quedará fuera de contrato tras Wave 0. Conviene validar ese cambio de API antes de ejecutar waves posteriores.
- La feature previa de sign-out dejó varios artefactos rotos o redundantes. El riesgo principal no es de diseño sino de limpieza incompleta si no se retiran explícitamente en domain e infrastructure.

## Riesgos descartados del explore

- No se ha encontrado un módulo reutilizable de SessionDevice ya existente en src/ que merezca ser extendido.
- No hay templates de PLAN.md específicos en el repositorio; el formato estándar de .orchestra es el correcto.
- No se ha visto necesidad inicial de tocar JwtRefreshStrategy, JwtUserStrategy o decorators para implementar la lógica de negocio, salvo validación final de arquitectura.

## Bloqueos actuales

- No hay bloqueos técnicos duros para planificar.
- Queda una decisión abierta, no bloqueante, sobre la semántica exacta del refresh token durante refresh.
- Queda una dependencia externa probable: que el cliente de login pueda enviar deviceId, sessionDeviceType y name cuando se ejecute la Wave 0.
