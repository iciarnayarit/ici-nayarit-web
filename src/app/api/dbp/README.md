# API DBP (Proxy local)

Esta API local expone la colección `[M] DBP API Reference v4` de dos formas:

- `GET /api/dbp/<path_dbp>?<query>`
- `GET /api/dbp/<recurso>/<...subruta>?<query>` (rutas por recurso)

Ejemplo:

- DBP: `/languages?language_code=spa&v=4`
- Local: `/api/dbp/languages?language_code=spa`

## Configuración

Variables de entorno requeridas:

- `DBP_API_KEY`: llave de Digital Bible Platform.
- `DBP_BASE_URL` (opcional): por defecto `https://4.dbt.io/api`.

## Endpoints de la colección cubiertos

- `/api/dbp/alphabets`
- `/api/dbp/alphabets/:script_id`
- `/api/dbp/languages`
- `/api/dbp/languages/:id`
- `/api/dbp/numbers`
- `/api/dbp/numbers/range`
- `/api/dbp/numbers/:id`
- `/api/dbp/countries`
- `/api/dbp/countries/:id`
- `/api/dbp/bibles`
- `/api/dbp/bibles/:id`
- `/api/dbp/bibles/:id/book`
- `/api/dbp/bibles/defaults/types`
- `/api/dbp/bibles/:id/copyright`
- `/api/dbp/bibles/filesets/media/types`
- `/api/dbp/bibles/filesets/:fileset_id/:book/:chapter`
- `/api/dbp/timestamps`
- `/api/dbp/timestamps/:fileset_id/:book/:chapter`
- `/api/dbp/search`

## Rutas bonitas por recurso

Estas rutas evitan armar el path manual en frontend:

- `/api/dbp/languages` y `/api/dbp/languages/:id`
- `/api/dbp/alphabets` y `/api/dbp/alphabets/:script_id`
- `/api/dbp/numbers`, `/api/dbp/numbers/range`, `/api/dbp/numbers/:id`
- `/api/dbp/countries` y `/api/dbp/countries/:id`
- `/api/dbp/bibles`, `/api/dbp/bibles/:id`, `/api/dbp/bibles/:id/book`, etc.
- `/api/dbp/timestamps` y `/api/dbp/timestamps/:fileset_id/:book/:chapter`
- `/api/dbp/search`

## Notas

- El proxy agrega automáticamente `key=<DBP_API_KEY>`.
- Si no envías `v`, agrega `v=4` por defecto.
- Reenvía los parámetros query tal cual.
