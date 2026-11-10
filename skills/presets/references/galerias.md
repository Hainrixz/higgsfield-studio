# Las galerías de `get_presets`

Leído del esquema y de respuestas en vivo (noviembre 2026). Los catálogos cambian cada semana: se navegan, no se copian.

## Parámetros

| Parámetro | Qué hace |
|---|---|
| `source` | `viral`, `marketing_studio`, `genjutsu`, `soul`, `recraft`, `katana`, `what_if`, `shorts_studio`. Sin él: mezcla de virales y Marketing Studio |
| `category` | Slug de categoría. Por defecto `all`. Usa los slugs que devuelve la propia respuesta en `categories` |
| `query` | Busca en nombres, descripciones y tipos; todas las palabras tienen que coincidir. No se combina con `preset_id`. No existe en Katana |
| `preset_id` | Abre la ficha de una plantilla. Vale su id, su slug o su nombre exacto. Con `category: "all"` y sin `cursor` |
| `initial_inputs` | Prellena la ficha con los campos de `execution.input_schema`. Solo `media_id` confirmados, nunca rutas. Admite entradas parciales. No envía nada |
| `limit` | 1 a 50, por defecto 12. Katana: por defecto 4, máximo 20 |
| `cursor` | El `next_cursor` de la página anterior, con los mismos filtros. Solo cuando pidan otra página |
| `katana_source` | `higgsfield` o `community`. Solo con `source: "katana"` |

## Qué devuelve una lista

`source`, `category`, `categories` (slugs válidos), `items`, `next_cursor` y `total`. Cada elemento trae `id`, `name`, vista previa (`thumbnail_url`, `preview_url`, `preview_type`) y, según la galería, `description`, `kind` o `type`.

Tamaños en noviembre 2026, para dar una idea: 87 efectos virales, 418 plantillas de producto en Marketing Studio.

## Qué devuelve una ficha

Al abrir con `preset_id`, la ficha trae el bloque `execution`:

- `execution.input_schema`: los campos que pide la plantilla y de qué tipo.
- `execution.available`: si esa plantilla se puede ejecutar. Es capacidad, no permiso.
- `execution.readiness`: si las entradas que pasaste alcanzan. Comprueba estructura, no que el archivo sea tuyo ni que esté confirmado.
- Precio, cuando la galería lo calcula (en los estilos de Genjutsu viene como `execution.cost_credits`). Si no viene, se dice que no se puede saber de antemano y que aun así puede gastar créditos.

Las entradas opcionales y los medios que la plantilla trae incorporados no cuentan como autorización para generar.

## Galería por galería

### `viral`
Efectos de Viral Hub: cadenas que transforman una foto en un video corto. Ejecutable con `execute_preset`.

### `marketing_studio`
Plantillas de Marketing Studio. Categorías: `product-shot`, `motion`, `effects`. Ejecutable. Para UGC, anuncios, pósters y marketplace con interfaz, el servidor prefiere el widget `show_marketing_studio_v2`.

### `genjutsu`
- `genjutsu`: ejemplos curados por Higgsfield. Es lo que abre `/genjutsu` a secas.
- `genjutsu-trending`: lo popular de la comunidad. Es la categoría para "top", "popular" o "trending". Se respeta el orden que devuelve.
- `genjutsu-new`: lo nuevo de la comunidad.
- `genjutsu-styles`: estilos con nombre que redibujan el video de la persona conservando su movimiento. Su `preset_id` tiene la forma `genjutsu-style:<id>`.

Con las tres primeras, `initial_inputs: { character_sheet: [{ id, type }] }` prellena la galería con un personaje (`type` es `image_job` para una hoja generada o `media_input` para una imagen subida; siempre lista de un elemento). Ahí la persona elige movimiento y genera desde el widget: no llames a `generate_video` ni a `execute_preset` después.

Ejecutable con `execute_preset` y `source: "genjutsu"`.

### `soul`
Estilos curados de Soul 2.0. **No ejecutable.** El `id` es el `style_id` para `generate_image` o `generate_image_batch` con `model: "soul_2"`. Las vistas previas son muestras, no entradas.

### `recraft`
Los estilos de Recraft que la persona guardó en Higgsfield (no los de otra cuenta de Recraft). `query` busca por nombre; `preset_id` es el UUID del estilo. **No ejecutable.** El `id` es el `style_id` para `model: "recraft_v4_styles"`.

### `katana`
Catálogo para que la persona navegue. `category`: `personalized_edits`, `style_transfer`, `motion_transfer`. No admite `query` ni `initial_inputs`. `preset_id: "<slug>"` abre el formulario de un preset, y solo se usa cuando las instrucciones de ese `/katana/<slug>` lo indican. Para **elegir** un preset por estilo o tema no se abre esta galería: se llama a `get_preset_instructions` sin `preset`, se compara contra títulos y descripciones, y se carga el `/katana/<slug>` exacto.

### `what_if` y `shorts_studio`
Abren las galerías de `/content-factory` y `/shorts`. Solo para el comando a secas o cuando piden ver los estilos. Sin filtros. La persona elige y escribe el tema ahí; el widget manda un mensaje armado al chat.

## Ejecutar

`execute_preset` recibe `source` (`viral`, `marketing_studio` o `genjutsu`), `preset_id` e `inputs` (objeto libre con la forma de `execution.input_schema`).

Orden de comprobación antes de llamarlo:

1. ¿La persona pidió generar con esa plantilla, con esas palabras o pulsando Recreate? Si no, no.
2. ¿`execution.available` es verdadero? Si no, devuelve error sin crear trabajo.
3. ¿`execution.readiness` está completo? Si falta algo, se pide.
4. ¿Todos los medios son `media_id` confirmados?

Una ejecución aceptada devuelve `job_ids`; una plantilla puede producir varias salidas. Un trabajo se muestra con `job_display`; varios, con `jobs_wait` y un solo `show_generation_by_ids`. No se ejecuta dos veces.

### Ejemplo: estilo de Genjutsu sobre un video

1. `get_presets` con `source: "genjutsu"`, `category: "genjutsu-styles"`, `query: "<nombre del estilo>"`. Si coinciden varios, se pregunta cuál.
2. El video a restilizar dura de 4 a 30 s y tiene que estar subido. Hasta 5 imágenes de referencia opcionales.
3. Precio: `get_presets` con el `preset_id` y `initial_inputs: { video: ["<uuid>"], references: [...], resolution: "720p" }`.
4. Solo si piden generarlo: `execute_preset` con `inputs: { video, references, resolution, prompt }`.

## Explicativos

Catálogo aparte, con sus dos herramientas:

1. `get_explainer_presets` (sin parámetros): devuelve `id`, `title`, `aspect`, imagen y video de muestra. 22 estilos en noviembre 2026.
2. `resolve_explainer_preset` con `preset_id` o `preset_name` (el título exacto): el servidor importa la imagen de estilo a los medios de la persona y devuelve un `media_id`.
3. Ese `media_id` va como imagen de referencia de estilo en las generaciones de todas las escenas del video.

La producción del video explicativo en sí sigue el workflow `faceless-video` (`get_workflow_instructions`). Cómo encaja exactamente esa referencia en sus pasos se lee ahí.
