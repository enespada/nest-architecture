# CONTEXT: user-blocked

## Decisiones de planificación derivadas del análisis

- El stack detectado es NestJS con Clean Architecture real en src/api, src/application, src/domain y src/infrastructure, más TypeORM y Swagger.
- La feature necesita un módulo nuevo user-blocked, pero también modifica la feature existente user porque los flags isBlockedByLogged y blockedLogged forman parte del JSON del usuario consumido por Flutter.
- El endpoint GET users/blocked/paginate debe tratarse como un contrato específico de Flutter: la app cliente consume response.data ?? [] y no response.data.data, por lo que no debe heredarse automáticamente la respuesta PageDTO usada en otros listados.
- Los endpoints users/me, users/:id, users/paginate y users/blocked/paginate deben ser auth-aware para calcular flags con el usuario autenticado.
- Conviene modelar el bloqueo como relación persistida blocker -> blocked con restricción de unicidad y regla de no self-block.

## Convenciones relevantes para Workers

- Mantener path aliases del proyecto: @application, @domain, @infrastructure, @controller, @core, @environments.
- Mantener controllers thin: validación, Swagger, guards y delegación al application service.
- Mantener contratos framework-agnostic en domain y mapeos explícitos Entity <-> Domain en infrastructure.
- Alinear Swagger con DTOs y con el payload real entregado al frontend.
- Cualquier comentario nuevo debe ir en inglés.

## Riesgos activos a monitorear

- El users/paginate actual es público; para exponer flags correctos probablemente deba pasar a autenticado o degradar flags cuando no haya usuario, y eso impacta contrato y seguridad.
- El repo usa User como shape de dominio y también de salida HTTP; añadir flags opcionales puede arrastrar cambios a varias rutas existentes.
- La join table de bloqueos puede introducir joins caros o duplicados en paginación si no se define el acceso de repositorio con cuidado.
- Puede aparecer dependencia circular entre UserModule y UserBlockedModule si se comparten servicios en vez de exportar contratos y providers mínimos.

## Descartado del análisis

- No existe feature previa de blocked o follow que sea reutilizable.
- No hay templates de PLAN.md en el repositorio.
- No hay tests de user existentes dentro de src; el único e2e actual es test/app.e2e-spec.ts, así que la cobertura nueva debe introducir su propio archivo.
