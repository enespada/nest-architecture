---
description: 'Use when writing or updating Jest unit tests or e2e tests in the Nest architecture template. Covers test commands, mirroring patterns, and repository/service testing expectations.'
applyTo: 'test/**/*.ts'
---

# Nest Testing Guidelines

- Prefer unit tests for application services and e2e tests for controller and module integration.
- Mirror feature structure where practical so test intent is obvious.
- Mock domain repository interfaces in service tests instead of coupling tests to TypeORM.
- Use `npm test` for unit coverage during development and `npm run test:e2e` for endpoint validation.
- Keep fixtures focused and explicit; avoid large shared setup when a local test factory is enough.
- Write test names and any inline comments in English.
