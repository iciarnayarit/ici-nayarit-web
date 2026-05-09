# ICIAR Nayarit Web — Documentación Técnica

Aplicación web construida con **Next.js (App Router)** para contenido bíblico, formación, comunidad y operación interna de ministerios.

## Stack Principal

- **Frontend:** Next.js 15, React 19, TypeScript, TailwindCSS, Radix UI, lucide-react.
- **Autenticación:** Clerk.
- **Datos y persistencia:** MongoDB (colecciones operativas), Sanity (contenido), Firebase (integraciones auxiliares).
- **Observabilidad:** Vercel Analytics + Speed Insights.
- **Build/performance:** compresión Brotli/Gzip, tree-shaking, optimizaciones de carga y memoización.

## Arquitectura de la Aplicación

La app usa una arquitectura por capas dentro de `src/`:

- `src/app/`: rutas App Router (pantallas y API Routes).
- `src/app/components/`: componentes UI y módulos funcionales de alto nivel.
- `src/app/hooks/`: hooks reutilizables (`debounce`, `throttle`, etc.).
- `src/lib/`: lógica de dominio, utilidades, resiliencia, cache, integración externa.
- `src/middleware.ts`: reglas Edge (A/B testing, geofencing y contexto de request).

### Flujo de alto nivel

1. **Cliente** renderiza pantallas públicas/dashboard con Server + Client Components.
2. **API Routes** en `src/app/api/**` centralizan acceso a datos e integraciones externas.
3. **Capa `lib`** aplica algoritmos de cache, rate limit, balancing, retry, clasificación, recomendaciones.
4. **Middleware (Edge)** inyecta headers/cookies de contexto y redirecciones tempranas por región.

## APIs Disponibles

> Base: `src/app/api/**/route.ts`

### Engagement / Comunidad

- `POST /api/engagement-points`: registro de puntos de interacción.
- `GET /api/trivia-ranking`: ranking de trivia (diario/por zona horaria configurada).
- `GET /api/trivia-recommendations`: recomendaciones por filtrado colaborativo.
- `GET|POST /api/members`: miembros y operación asociada.
- `GET /api/staff-roles`: catálogo de roles.
- `GET /api/ministries`: catálogo de ministerios.

### Biblia / Lectura / Contenido

- `GET /api/churches`: búsqueda de templos (con `?q=` y fuzzy).
- `GET /api/enciclopedia/search`: búsqueda en enciclopedia (JSON o NDJSON con `?stream=1`).
- `GET /api/enciclopedia/recommendations`: recomendaciones relacionadas para entradas de enciclopedia.
- `POST /api/reading-plan-progress`: progreso de planes.
- `GET /api/reading-plan-totals`: métricas/resumen de planes.
- `POST /api/nlp/classify`: clasificación NLP de notas/reflexiones.

### Traducción / correo / carga de archivos

- `POST /api/translate`: traducción con balanceo, backoff, circuit breaker, cache semántico y streaming NDJSON.
- `POST /api/send-email`: envío de correo con validación + rate limit.
- `POST /api/upload-alabanza`: carga de recursos a Google Drive.

### DBP Proxy (Bible APIs)

- Endpoints de proxy para alfabetos, idiomas, biblias, filesets, timestamps, números, países y passthrough:
  - `GET /api/dbp/*`
  - Incluye rutas como `/api/dbp/bibles`, `/api/dbp/languages`, `/api/dbp/timestamps`, `/api/dbp/[...path]`, etc.
- Diagnóstico homogéneo: respuestas de DBP proxy incluyen header `X-Circuit-State` (estado de circuit breakers `dbp:proxy` y `dbp:json`).

### Revalidación de caché

- `POST /api/revalidate`: invalidación quirúrgica por `revalidateTag` usando secreto.
- `POST /api/revalidate/commentary`: revalida tags de comentarios HelloAO automáticamente a partir de `commentaryId`, `book`, `chapter`.
- `POST /api/revalidate/commentary` acepta parámetros tanto por JSON body como por query string (`commentaryId|id`, `book|bookUsfm`, `chapter`, `includeCatalogTag`).
- Header requerido en ambos: `x-revalidate-secret: <REVALIDATE_SECRET>`.

### Telemetría interna de rate limit (Ops)

- `GET /api/telemetry/rate-limit`: snapshot de bloqueos por endpoint/key (uso interno).
- `GET /api/telemetry/retries`: snapshot de ranking de reintentos por operación/proveedor.
- `GET /api/telemetry/upstreams`: snapshot de métricas del balanceador (requests/errors/latencia).
- `GET /api/telemetry/panel`: **agregado** — las tres capas anteriores en un solo JSON (`schemaVersion`, `rateLimit`, `retries`, `upstreams`, `generatedAt`). Query opcional: `limitRate`, `limitRetries`, `limitUpstreams`, `namespace` (mismos límites máximos que los endpoints individuales).
- `GET /api/ops/rate-limit-telemetry`: alias para dashboards operativos internos.
- `GET /api/ops/upstream-metrics`: métricas runtime de upstreams (requests, errors, avg latency, timestamps).
- `GET /api/ops/retry-metrics`: ranking runtime de reintentos por operación/proveedor (retries y avg delay).
- `GET /api/ops/panel`: **agregado** — mismo payload que `/api/telemetry/panel`; acepta también `x-ops-secret` además de `x-telemetry-secret` / `x-revalidate-secret`.
- `GET /api/ops/health-snapshot`: **agregado** — misma combinación rate-limit + retries + upstreams que el panel, con `kind: "health-snapshot"` en la respuesta (útil para dashboards de salud). Mismos query params y cabeceras que `/api/ops/panel`.
- Seguridad por header secreto:
  - `x-ops-secret` **o**
  - `x-telemetry-secret` **o**
  - `x-revalidate-secret`

Ejemplo desde webhook/evento de actualización:

```bash
curl -X POST "$APP_URL/api/revalidate/commentary" \
  -H "Content-Type: application/json" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -d '{
    "commentaryId": "esrv",
    "book": "JHN",
    "chapter": 3
  }'
```

También funciona sin body (solo query string):

```bash
curl -X POST "$APP_URL/api/revalidate/commentary?commentaryId=esrv&book=JHN&chapter=3&includeCatalogTag=1" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET"
```

## Algoritmos y Técnicas Implementadas

### Rendimiento UI / Rendering

- **Streaming con Suspense (shell + slots)** para carga progresiva.
- **Memoización React** con `useMemo`, `useCallback`, `React.memo` en componentes de alto costo.
- **Debounce/Throttle** para input, scroll, resize y reducción de re-renders.
- **Dynamic Imports + lazy-on-view** (IntersectionObserver) para mejorar TTI.
- **Prefetch por visibilidad** de enlaces en listas de navegación.

### Cache y datos

- **RAM cache TTL + LRU** en `src/lib/ram-cache.ts`.
- **Memoización de data fetching server-side** con `cache(...)` de React donde aplica.
- **Semantic cache** en `src/lib/semantic-cache.ts` para reutilizar respuestas similares.
- **ISR + tags + revalidateTag** para regeneración incremental controlada.

### Resiliencia y protección de APIs

- **Rate limiting**:
  - Token Bucket (`src/lib/rate-limit.ts`)
  - Leaky Bucket (`src/lib/rate-limit.ts`)
- **Telemetry de 429** por endpoint (`src/lib/rate-limit-telemetry.ts`).
- **Exponential backoff** (`src/lib/exponential-backoff.ts`).
- **Circuit breaker** (`src/lib/circuit-breaker.ts`).
- **Load balancing** Round Robin / Least Connections (`src/lib/load-balancer.ts`).

### Búsqueda, recomendaciones y NLP

- **Fuzzy search** (similitud y normalización) en `src/lib/fuzzy-search.ts`.
- **Collaborative filtering** (cosine similarity, top-k) en `src/lib/collaborative-filtering.ts`.
- **Clasificador NLP local** para categorías/tags en `src/lib/nlp-classifier.ts`.

### Optimización de assets

- **Compresión Brotli/Gzip** en build de cliente (`next.config.ts` + `compression-webpack-plugin`).
- **Tree shaking** y optimización de imports (`usedExports`, `innerGraph`, `optimizePackageImports`).
- **Optimización de imágenes** con `next/image` (sizes, blur placeholders, formatos optimizados).
- **Optimización de fuentes** con `next/font/google` para reducir layout shift.

## Middleware y Edge Runtime

Definido en `src/middleware.ts`:

- **A/B testing persistente** por cookie (`iciar_ab_landing_v1`) con bucket `a|b`.
- **Geofencing** por headers de Vercel (`x-vercel-ip-*`) con normalización de región.
- **Redirección temprana** `/church -> /templos` para Nayarit.
- **Headers de contexto**:
  - `x-iciar-ab-landing`
  - `x-iciar-geo-region`

## Pantallas / Rutas Principales

### Públicas

- `/` (home)
- `/biblia`, `/bible`
- `/comparador`, `/biblia/comparador`
- `/comentarios`, `/comentarios/[id]`, `/comentarios/[id]/[book]/[chapter]`
- `/enciclopedia`, `/enciclopedia/[slug]`
- `/planes`, `/planes/[slug]`, `/planes/guardados`
- `/avisos`, `/avisos/[slug]`
- `/templos`, `/church`
- `/recursos`, `/recursos/[slug]`
- `/historia`, `/historia/legado`, `/historia/regiones`
- `/radio`, `/videos`, `/doctrina`, `/lexico-biblico`, `/perfil`

### Dashboard

- `/dashboard/biblia`
- `/dashboard/comparador`
- `/dashboard/notas`
- `/dashboard/trivia`, `/dashboard/trivia/[topic]`
- `/dashboard/insignias`
- `/dashboard/planes`
- `/dashboard/templos`, `/dashboard/templos/[slug]`
- `/dashboard/miembros`
- `/dashboard/recursos`
- `/dashboard/avisos`
- `/dashboard/imagenes`

## Configuración de Entorno (Variables relevantes)

> No pongas secretos reales en este README. Usa `.env.local` o secretos de plataforma.

- **MongoDB**
  - `STORAGE_MONGODB_URI`
  - `STORAGE_MONGODB_DB_NAME`
  - `STORAGE_MONGODB_MEMBERS_COLLECTION`
  - `STORAGE_MONGODB_BADGES_COLLECTION`
  - `STORAGE_MONGODB_RANKING_COLLECTION`
  - `STORAGE_MONGODB_TRIVIA_RANKING_COLLECTION`
  - `STORAGE_MONGODB_CHURCHES_COLLECTION`
  - `STORAGE_MONGODB_MINISTRIES_COLLECTION`
  - `STORAGE_MONGODB_STAFF_ROLES_COLLECTION`
  - `STORAGE_MONGODB_PLANS_COLLECTION`
- **DBP / upstreams**
  - `DBP_API_KEY`
  - `DBP_BASE_URL` / `DBP_BASE_URLS` / `DBP_UPSTREAMS`
  - `DBP_LOAD_BALANCE_STRATEGY`
- **Rate/cache/revalidate**
  - `RAM_CACHE_MAX_ENTRIES`
  - `REDIS_URL`
  - `REDIS_KEY_PREFIX`
  - `REDIS_CONNECT_TIMEOUT_MS`
  - `REDIS_DISABLED` (opcional, `1` para forzar solo RAM)
  - `REVALIDATE_SECRET`
- **Traducción**
  - `TRANSLATE_LOAD_BALANCE_STRATEGY`
- **Ranking**
  - `TRIVIA_RANKING_TIMEZONE`
- **Google Drive (upload alabanza)**
  - `GOOGLE_CLIENT_EMAIL`
  - `GOOGLE_PRIVATE_KEY`
  - `GOOGLE_DRIVE_FOLDER_ID`
- **Firebase (cliente)**
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`

## Scripts de Desarrollo

- `yarn dev`: entorno local (Next + Turbopack, puerto 9003).
- `yarn build`: build de producción.
- `yarn start`: iniciar build de producción.
- `yarn lint`: lint del proyecto.
- `yarn typecheck`: chequeo de tipos TS.
- `yarn encyclopedia:export-json`: export de contenido de enciclopedia.

## Decisiones Técnicas Relevantes

- Se prioriza **experiencia percibida**: shell streaming, carga incremental, placeholders e interacciones optimistas.
- Se prioriza **resiliencia de integraciones externas**: retry/backoff + circuit breaker + balancing.
- Se prioriza **protección backend**: token/leaky bucket + telemetría de 429.
- Se prioriza **escalabilidad de lectura/escritura** en memoria: cache TTL + LRU y revalidación quirúrgica por tags.

## Recomendaciones Operativas

- Ejecutar `yarn lint && yarn typecheck` antes de despliegue.
- Mantener `REVALIDATE_SECRET` rotado y fuera de repositorio.
- Monitorear logs de 429 y ajustar capacidad/refill de buckets por endpoint.
- Revisar periódicamente parámetros de cache (`TTL`, `RAM_CACHE_MAX_ENTRIES`) según tráfico real.
