---
name: imagen
description: Genera y edita imágenes con Higgsfield. Texto a imagen, edición con una foto de referencia, carteles y piezas con texto dentro, GIF animado y SVG nativos, estilos de Soul y de Recraft, y tandas de varias imágenes distintas. También lleva a los flujos de miniaturas, manga y cómic, y activos de marca. Úsala si dices "hazme una imagen", "genera una foto de…", "edita esta foto", "cámbiale el fondo", "ponle este texto", "un póster", "un logo", "un GIF", "un SVG", "un sticker con fondo transparente", "una miniatura de YouTube", "una portada para el reel", "un manga", "un cómic", "varias imágenes para un carrusel" o "con el estilo de Soul". EN: text-to-image, image editing, typography, native GIF/SVG, Soul and Recraft styles, thumbnails, manga, brand assets on Higgsfield.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Imagen

Todo lo que acaba en una imagen fija (o en un GIF) sale de aquí, con `generate_image` para una pieza y `generate_image_batch` para varias distintas. Carga antes la skill `estudio`: conexión, subida de archivos, costo, espera y entrega se hacen como dice ella. Aquí solo va lo propio de imagen.

## Cuándo se activa

- Piden una imagen nueva desde una descripción.
- Piden cambiar una imagen que ya existe: fondo, ropa, color, texto, estilo.
- Piden una pieza con texto dentro: póster, cartel, portada, cita, banner.
- Piden un GIF, un SVG, un icono o un PNG con fondo transparente.
- Piden una miniatura, una portada de video, un manga o cómic, un logo o material de marca.

No es de aquí: fotos del producto de la persona (`producto`), anuncios (`anuncios`), un personaje que se repite (`personajes`), escalar o quitar fondo a algo ya hecho (`editar`).

## Procedimiento

1. **Mira si es un flujo con dueño.** Tres encargos tienen su propio flujo en el servidor y se cargan **antes** de llamar a `generate_image`:

   | Piden | Se carga con | Para saber |
   |---|---|---|
   | Miniatura de YouTube, portada de video o de reel | `get_workflow_instructions` con `workflow: "thumbnail-generation"` | Pregunta quién sale en la imagen y cuántas variantes; rinde en 4K; el texto va en capa aparte salvo que lo pidan dentro |
   | Logo, identidad, brandbook, mockups, pósters o banners **de marca** | `get_workflow_instructions` con `workflow: "brand-asset-creation"` | Usa `sandbox_exec`; respeta el logo oficial sin redibujarlo; el logo vectorial nuevo sale de `recraft_v4_1` |
   | Manga, cómic, webtoon | `get_preset_instructions` con `preset: "/manga"` | Ese comando es la entrada; por dentro usa el flujo `manga-engine`. Pide aprobar el guion y luego el precio: son paradas del servidor, se respetan |

   Sigue el texto que devuelvan al pie de la letra; los archivos que mencionen se leen con `get_workflow_bundle_file`. Si el encargo no es ninguno de estos, sigue al paso 2.

2. **Elige el modelo.** Si la persona nombró uno, es ese. Si no:

   | Para | Modelo |
   |---|---|
   | Casi todo: foto realista, texto dentro, editar con referencia, GIF, SVG | `gpt_image_2_6` |
   | Máxima calidad, diagramas, hasta 14 referencias, 4K | `nano_banana_pro` |
   | Retoque por instrucción sobre una imagen ya hecha, PNG transparente | `seedream_5_5` |
   | Retrato, moda, look de creador | `soul_2` (con `style_id` si quieren un estilo) |
   | Logo, icono, ilustración vectorial, paleta exacta en hex | `recraft_v4_1` |
   | Borrador rápido y barato | `z_image` o `nano_banana` |

   Parámetros de cada uno, proporciones y roles en `references/modelos-y-formatos.md`. Para lo demás, `models_explore` con `action: "recommend"` y el `query` descrito con contexto ("text-only", "reference image").

3. **Escribe el prompt en inglés.** Si la imagen tiene que salir bien y no solo salir, pasa antes por `direccion-de-arte`. El texto que debe leerse en la imagen va tal cual, en su idioma y entre comillas: `reading exactly "Abrimos el lunes"`.

4. **Arma `params`.** `model`, `prompt`, `aspect_ratio` y los propios del modelo (`resolution`, `quality`, `output_format`…), todos al mismo nivel. Las referencias van en `medias` con el rol que declare el modelo: `image_references` en los GPT Image, Nano Banana y Seedream; `image` en `soul_2`. Si te equivocas de rol y es evidente, el servidor lo corrige y lo avisa en `adjustments`.

5. **Lanza, espera y entrega** como dice `estudio`.

## Una, variantes o tanda

| Quieren | Cómo |
|---|---|
| Una imagen | `generate_image` |
| 2 a 4 versiones del **mismo** prompt | `generate_image` con `count` |
| 2 a 12 imágenes **distintas** (carrusel, serie, varios ángulos) | `generate_image_batch`: un elemento por imagen en `requests[]`, cada uno con su `index` y sus `params` |
| Más de 12 | Varias tandas; junta los trabajos y enséñalos con un solo `show_generation_by_ids` (hasta 60) |

La tanda no abre visor y no acepta `get_cost` ni `count`. Para dar el costo antes, consulta **una** pieza representativa con `generate_image` y `get_cost: true`, y multiplica. Una tanda puede salir a medias: guarda los `job_id` que sí volvieron y reintenta solo los índices rechazados.

## GIF y SVG

Salen del propio `generate_image` con `gpt_image_2_6` (o `gpt_image_2_6_flare`), no de un video convertido:

- **GIF:** `output_format: "gif"`. Admite referencias. Controles: `size` (`ANCHOxALTO`, por defecto `288x288`, cada lado divisible entre 16), `frame_count` (2–64, por defecto 9) y `frame_duration_ms` (20–2000, por defecto 200).
- **SVG:** `output_format: "svg"`. **Sin** imágenes de referencia: es solo desde texto.
- **Fondo transparente:** `background: "transparent"`.
- Para vectorizar una imagen que ya existe: `ideogram_vector` con `operation: "vectorize"`.

## Estilos

- **Soul:** `get_presets` con `source: "soul"` lista los estilos curados (busca por nombre con `query`). El `id` de cada uno es el `style_id` que pasas a `generate_image` con `model: "soul_2"`. Se combina con `soul_id`, pero **no** con `medias`. No se ejecuta con `execute_preset`. Si no pidieron estilo, omite `style_id`.
- **Recraft:** `get_presets` con `source: "recraft"` lista los estilos que la persona guardó en su cuenta. El `id` va como `style_id` con `model: "recraft_v4_styles"` (no `recraft_v4_1`). Si la lista sale vacía, no tiene estilos guardados: dilo y no lo sustituyas por otro.

Enseñar la galería no es generar: genera cuando haya un estilo elegido o cuando la petición ya lo nombraba.

## Errores comunes

- **Pasar una URL en `medias`.** Solo `media_id` o `job_id`. Las URL se importan primero (`estudio`).
- **Editar sin decir qué se queda.** En una edición, di qué cambia y añade que todo lo demás queda igual (`keep everything else exactly unchanged`).
- **Quedarte con la calidad por defecto en una pieza final.** `gpt_image_2_6` sale en `quality: "low"` y `resolution: "1k"`. Para entregar, súbelos; cuestan más, así que mira el precio con `get_cost`.
- **Pedir una proporción que el modelo no tiene.** `4:5` no existe en todos. Míralo antes; si el servidor la cambia, dilo.
- **`count` para cosas distintas.** `count` repite el mismo prompt. Prompts distintos van en tanda.
- **Estilo de Soul junto con una imagen de referencia.** No se puede: o `style_id` o `medias`.
- **Usar `generate_video` para un GIF.** El GIF es una imagen.
- **Texto largo dentro de la imagen.** Pocas palabras, exactas y entre comillas. Si son párrafos, genera la imagen limpia y deja el texto para el montaje.

## A dónde seguir

| Después quieren | Skill |
|---|---|
| Que la imagen se mueva | `animar` |
| Más resolución, ampliar el lienzo, quitar el fondo | `editar` |
| La misma cara en muchas imágenes | `personajes` |
| Fotos de su producto real | `producto` |
| Anuncios con copy | `anuncios` |
| Plantillas y efectos de la galería | `presets` |
| Un prompt mejor pensado | `direccion-de-arte` |
