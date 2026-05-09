# ICIAR Nayarit Web — README Ejecutivo

Plataforma digital para contenido bíblico, formación, comunidad y operación interna de ministerios ICIAR Nayarit.

## Qué resuelve

- Centraliza experiencia pública y dashboard interno en una sola app web.
- Mejora alcance ministerial con recursos, planes, trivia, avisos, templos y contenidos bíblicos.
- Acelera publicación y operación con APIs propias, cache inteligente y automatizaciones.

## Impacto de negocio (resumen)

- **Mejor experiencia percibida:** carga progresiva (streaming), optimización de imágenes/fuentes y bloques diferidos.
- **Mayor resiliencia:** rate limit, backoff, circuit breaker y balanceo de upstreams.
- **Escalabilidad operativa:** cache en RAM + Redis fallback, revalidación por tags, telemetría de abuso/reintentos.
- **Personalización:** A/B testing en edge, recomendaciones por comportamiento y clasificación de contenido.

## Capacidades principales

- **Frontend moderno:** Next.js + React + TypeScript.
- **Seguridad y acceso:** Clerk.
- **Datos:** MongoDB (operación), Sanity (contenido), Firebase (servicios auxiliares).
- **APIs clave:** traducción, email, members, ranking/recomendaciones, progreso de lectura, telemetría interna.
- **Observabilidad:** métricas de rendimiento y señales operativas para monitoreo.

## Rutas de alto valor

- **Públicas:** `/`, `/biblia`, `/comentarios`, `/enciclopedia`, `/planes`, `/avisos`, `/templos`, `/recursos`.
- **Dashboard:** `/dashboard/biblia`, `/dashboard/trivia`, `/dashboard/planes`, `/dashboard/templos`, `/dashboard/miembros`.

## Operación y gobierno

- Revalidación segura de caché mediante secreto (`REVALIDATE_SECRET`).
- Telemetría para 429 y estado de integraciones externas.
- Flujo recomendado pre-release: `yarn lint && yarn typecheck`.

## Documentación técnica completa

La documentación técnica detallada (arquitectura, APIs, algoritmos, variables, scripts y decisiones de ingeniería) vive en:

- `README.tech.md`
