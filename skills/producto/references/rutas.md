# Rutas del servidor para foto de producto

Leído del MCP en vivo (noviembre 2026). Si algo no coincide con lo que ves, manda lo que devuelva el servidor: vuelve a pedir `get_workflow_instructions` o `models_explore`.

## Workflow `product-photoshoot` (versión 1.0)

### Modos

Se elige uno por lo que se va a entregar. El formato o la plataforma ganan sobre el ambiente: pin de Pinterest antes que lifestyle, banner antes que lifestyle, carrusel antes que escena.

| Modo | Para | Archivo |
|---|---|---|
| `product-shot` | Packshot de estudio, catálogo, Shopify | `references/product-shot.md` |
| `lifestyle-scene` | Producto en un ambiente real o en uso | `references/lifestyle-scene.md` |
| `closeup-product-with-person` | Producto con manos o parte del rostro | `references/closeup-product-with-person.md` |
| `pinterest-pin` | Imagen vertical nativa de Pinterest | `references/pinterest-pin.md` |
| `hero-banner` | Cabecera ancha de web, email o campaña | `references/hero-banner.md` |
| `social-carousel` | 3 a 10 láminas conectadas | `references/social-carousel.md` |
| `ad-creative-pack` | Variantes estáticas coordinadas para pauta | `references/ad-creative-pack.md` |
| `virtual-model-tryout` | Producto puesto o usado por un modelo adulto generado | `references/virtual-model-tryout.md` |
| `conceptual-product` | Flotando, salpicadura, escultórico, estilo CGI | `references/conceptual-product.md` |
| `restyle` | Cambiar la estética de una imagen conservando sujeto y composición | `references/restyle.md` |

Correspondencia con las recetas de `recetas.md`: packshot limpio y bloque de color son `product-shot`; lifestyle y contexto de uso son `lifestyle-scene`; en la mano es `closeup-product-with-person`; el macro de textura sale como `product-shot` con encuadre cerrado.

### Contrato de generación

- Modelo: siempre `nano_banana_pro`. Sus roles de `medias`: `image_references`. Resoluciones: `1k`, `2k`, `4k` (el workflow fija `2k`).
- Cada pieza del batch:

  ```json
  {
    "index": 0,
    "params": {
      "model": "nano_banana_pro",
      "prompt": "<prompt del modo>\n\nresolution: 2k",
      "aspect_ratio": "<proporción del modo>",
      "resolution": "2k",
      "count": 1,
      "medias": [{ "value": "<media_id confirmado>", "role": "image_references" }]
    }
  }
  ```

- Sin `medias` solo si el producto va descrito con texto y la descripción alcanza (categoría, forma, empaque, material, color, etiqueta, rasgos).
- Envíos en grupos de 6; esperas con `jobs_wait` en grupos de 8, `timeout_seconds: 15`.
- Tras 12 esperas activas, se deja de esperar y se informan los pendientes con sus ids. Un trabajo lento no se reemplaza.
- Presupuesto por índice: tres envíos en total contando fallos y refinamientos. No se reinicia reescribiendo el prompt.
- Errores de seguridad, permisos, cuota o cobro no se reintentan.

### Lo que el workflow decide solo y lo que pregunta

Decide solo: 3 variantes, `1:1`, estilo `clean-studio`, paleta tomada del producto, modelo, resolución, lentes y luz. Pregunta solo, en un mensaje, si falta: descripción del producto (sin foto ni texto usable), estilo imposible de inferir, cantidad cuando cambia el entregable, proporción cuando el destino es de verdad ambiguo.

### Una diferencia con `estudio`

El texto del workflow pide que la foto local entre por `media_upload_widget`. Las instrucciones generales del servidor dicen que, si puedes leer el archivo, lo subes tú (`media_upload`, PUT, `media_confirm`) y que eso sustituye los pasos de widget. En Claude Code sigue la subida de `estudio`.

## Recetas con comando

`get_preset_instructions` sin argumentos lista las recetas (unas 80 en noviembre 2026). Las de producto incluyen, entre otras: `hero-shot`, `in-hand`, `flatlay`, `minimalist-white`, `luxury`, `on-desk`, `kitchen-scene`, `pedestal-shot`, `power-angle`, `angles`, `symmetry`, `water-splash`, `ice-capsule`, `color-pop`; láminas informativas como `benefits`, `specs`, `how-it-works`, `three-reasons`, `before-after`; y de movimiento (salida en video): `product-spin`, `half-turn`, `light-sweep`, `macro-glide`, `push-in`, `pull-back`, `crane-reveal`.

No copies esa lista a la persona como catálogo fijo: pídela en vivo. Cada receta devuelve sus parámetros y un prompt maestro; por ejemplo `/hero-shot` fija `gpt_image_2_6`, `3:4`, `2k`, calidad `high`. La receta manda sobre cualquier workflow de nombre parecido.

## Modelos de Marketing Studio

Míralos con `models_explore` `action: "get"` antes de usarlos.

| Modelo | Parámetros propios | Roles de `medias` | Proporciones |
|---|---|---|---|
| `marketing_studio_image` | `resolution`: `1k` (defecto), `2k`, `4k` | `image` | `auto`, `1:1`, `3:2`, `2:3`, `4:3`, `3:4`, `4:5`, `5:4`, `9:16`, `16:9`, `21:9` |
| `marketing_studio_2_image` | `type` **obligatorio**: `product_shots`, `product_shots_people`, `poster`, `ads`, `marketplace`. Opcionales: `preset_id` o `style_id` (excluyentes), `notes` y `want_person` (solo `ads` y `marketplace`), `brand_kit_id` | `input_images`, `product_image`, `character_photo`, `model_image` | `1:1`, `3:2`, `2:3`, `4:3`, `3:4`, `9:16`, `16:9` |

`marketing_studio_2_image` es el modelo detrás de las plantillas: el `type` de cada plantilla que devuelve `get_presets` (`product_shots`, `product_shots_people`…) es el mismo valor. Para una plantilla concreta, lo más seguro es `execute_preset` cuando lo pidan; llamar al modelo directo solo si tienes claro qué rol lleva cada imagen (si te equivocas en uno evidente, el servidor lo corrige y lo avisa en `adjustments`).

`brand_kit_id` y `style_id` salen de catálogos que este conector no lista con una herramienta propia. Si no tienes el id, no lo inventes: usa el widget.

## Galería y widget

- `get_presets` con `source: "marketing_studio"` devuelve `categories` (`all`, `motion`, `product-shot`, `effects`), `items`, `next_cursor` y `total`. `limit` por defecto 12, máximo 50.
- `show_marketing_studio_v2` abre el widget con pestañas `all`, `ugc`, `product-shot`, `motion`, `ads`, `posters`, `marketplace` (parámetro `category`). El widget elige plantilla, pide entradas, genera y muestra: no hace falta llamar nada después. Si devuelve error de selección de espacio de trabajo, pregunta cuál usar, `select_workspace` y vuelve a abrirlo.
- `show_marketing_studio_generations` lista lo ya generado en Marketing Studio (no aparece en `show_generations`).
