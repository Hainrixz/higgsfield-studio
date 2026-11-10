# Proyectos, carpetas y material: parámetros

Última revisión: noviembre 2026, leído de los esquemas. Salvo `create_folder`, todas piden `workspace_id` como contexto de la petición; eso no cambia el espacio de trabajo seleccionado.

## Paginación (igual en todas las listas)

- `size`: 20 por defecto, máximo 50.
- `cursor`: el que devolvió la página anterior, con **los mismos** filtros y el mismo espacio.
- Una página vacía con `has_more: true` **no** es el final. Sigue.

## Proyectos

| Herramienta | Obligatorios | Opcionales | Notas |
|---|---|---|---|
| `list_projects` | `workspace_id` | `search`, `size`, `cursor` | Devuelve `project_id`, `default_folder_id` y el `workspace_id` real de cada proyecto. Incluye proyectos compartidos de otros espacios. No lista sitios web ni escenas 3D |
| `create_project` | `name`, `workspace_id`, `idempotency_key` | `surface: "cinematic_studio"` | `surface` solo para un proyecto de Cinema; se omite para uno normal. No crea subcarpetas de arranque |
| `get_project` | `workspace_id`, `project_id` | — | Metadatos y qué se puede hacer con él (permisos) |
| `update_project` | `workspace_id`, `project_id` | `name`, `description`, `emoji`, `color`, `cover_image_url`, `preview_url` | Lo omitido no cambia; `null` borra los campos que lo admiten |
| `archive_project` | `workspace_id`, `project_id` | — | Reversible |
| `unarchive_project` | `workspace_id`, `project_id` | — | No cambia el contenido |
| `delete_project` | `workspace_id`, `project_id`, `confirm_delete: true` | — | Permanente, en cascada |

Colores de `update_project`: `cyan`, `slate`, `lime`, `violet`, `purple`, `pink`, `yellow`.

Si no sabes si puedes cambiar un proyecto (por ejemplo, uno compartido), mira antes `get_project`.

## Carpetas

| Herramienta | Obligatorios | Opcionales | Notas |
|---|---|---|---|
| `create_folder` | `project_id`, `name` | `parent_folder_id` | Sin padre, queda en la raíz. **No es idempotente**: no reintentes tras un timeout sin mirar |
| `list_folders` | `workspace_id`, `project_id` | `parent_folder_id`, `search`, `size`, `cursor` | Solo hijos directos del padre (o de la raíz) |
| `get_folder` | `workspace_id`, `project_id`, `folder_id` | — | Una carpeta; no lista hijos |
| `search_folders` | `workspace_id`, `project_id`, `search` | `size`, `cursor` | Busca por nombre en todo el proyecto |
| `move_folder` | `workspace_id`, `project_id`, `folder_id`, `target_parent_id` | — | Dentro del mismo proyecto |
| `rename_folder` | `workspace_id`, `project_id`, `folder_id`, `name` | — | No mueve ni borra el contenido |
| `delete_folder` | `workspace_id`, `project_id`, `folder_id`, `confirm_delete: true` | `cascade` | `cascade` es `false` por defecto |

Para que una generación caiga en una subcarpeta concreta, pasa su `folder_id` en la llamada de generación. Si no, se sigue usando el `default_folder_id` del proyecto.

## Material del proyecto

| Herramienta | Obligatorios | Opcionales |
|---|---|---|
| `list_project_assets` | `workspace_id`, `project_id` | `folder_id`, `output_kinds`, `source_types`, `statuses`, `model_ids`, `only_liked`, `order_by`, `ordering`, `size`, `cursor` |
| `get_project_asset_prompt` | `workspace_id`, `project_id`, `placement_id` | — |
| `get_project_asset_source` | `workspace_id`, `project_id`, `placement_id` | — |
| `attach_project_asset` | `workspace_id`, `project_id`, `folder_id`, `source` | — |
| `copy_project_asset` | `workspace_id`, `project_id`, `source_placement_id`, `target_folder_id` | `target_project_id` |
| `move_project_asset` | `workspace_id`, `project_id`, `placement_id`, `target_folder_id` | `target_project_id` |
| `remove_project_asset` | `workspace_id`, `project_id`, `placement_id`, `confirm_remove: true` | — |
| `resolve_project_assets` | `workspace_id`, `project_id`, `sources` | `folder_id`, `size`, `cursor` |

### Filtros de `list_project_assets`

| Filtro | Valores |
|---|---|
| `folder_id` | Una carpeta exacta, sin descendientes. Omitido: todo el proyecto |
| `output_kinds` | `image`, `video`, `audio`, `file`, `unknown` |
| `source_types` | `job`, `media_input`, `video_input`, `audio_input`, `file_input` |
| `only_liked` | Solo los marcados con me gusta |
| `order_by` | `created_at`, `added_at`, `liked_at` |
| `ordering` | `asc`, `desc` |
| `model_ids` | Hasta 20 ids de modelo |

Devuelve metadatos: `placement_id`, `item_id` y carpeta. **No** devuelve prompts, enlaces ni miniaturas.

### `source`: la forma `{type, id}`

Así se identifica algo que ya existe, para adjuntarlo o localizarlo:

| `type` | El `id` es |
|---|---|
| `job` | Una generación |
| `media_input` | Una imagen subida |
| `video_input` | Un video subido |
| `audio_input` | Un audio subido |
| `file_input` | Un archivo general (documento, zip) |

- `attach_project_asset` recibe un `source`. Volver a adjuntar lo mismo en la misma carpeta reutiliza la colocación.
- `resolve_project_assets` recibe `sources` (de 1 a 20) y dice en qué colocaciones del proyecto están. El id es el del trabajo o la subida original, **no** un `placement_id`.
- Para adjuntar un archivo general nuevo: súbelo con `media_upload` y `media_confirm` pasando `source_type: "file_input"`, y adjunta el id resultante.

### Copiar frente a mover

| | Resultado |
|---|---|
| `copy_project_asset` | Otra colocación del mismo original. No duplica el archivo. **No es idempotente** |
| `move_project_asset` | La misma colocación cambia de carpeta o de proyecto |
| `remove_project_asset` | Desaparece la colocación; el original sigue en la cuenta |

## Recetas

**"Guarda en una carpeta lo que acabamos de generar"**

1. `create_folder` en el proyecto.
2. `attach_project_asset` por cada trabajo, con `source: {type: "job", id: <job_id>}`.

**"¿Con qué prompt hice esta imagen?"**

1. `list_project_assets` filtrando por carpeta o tipo → `placement_id`.
2. `get_project_asset_prompt`.

**"Descárgame todo lo de este proyecto"**

1. `list_project_assets`, todas las páginas.
2. `get_project_asset_source` por cada `placement_id` → enlace de descarga.
3. Descarga enseguida: los enlaces pueden caducar.

**"Pasa esto al proyecto del otro cliente"**

1. `list_projects` → `project_id` y `default_folder_id` del destino.
2. `move_project_asset` con `target_project_id` y `target_folder_id`.

**"Limpia el proyecto"**

No es una orden de borrar. Pregunta qué quieren quitar, enseña la lista y prefiere archivar o quitar colocaciones antes que borrar.

## Tras una respuesta dudosa

Crear, copiar, mover, quitar y borrar no deben repetirse a ciegas. Mira primero el estado con la lista correspondiente (`list_projects`, `list_folders`, `list_project_assets`) y actúa según lo que veas.
