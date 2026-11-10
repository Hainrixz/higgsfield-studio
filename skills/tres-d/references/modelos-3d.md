# Modelos 3D de `generate_3d`

Última revisión: noviembre 2026, leído de `models_explore` con `type: "3d"`. El catálogo cambia: si un parámetro no aparece aquí o el servidor lo rechaza, consulta `models_explore` con `action: "get"` y el `model_id`.

Todos los parámetros de un modelo van al nivel superior de `params`, junto a `model`. Comunes a `generate_3d`: `medias`, `count` (1–4), `get_cost`, `folder_id`.

## Los cuatro de uso diario

| Modelo | Entrada | Rol en `medias` | Para qué |
|---|---|---|---|
| `image_to_3d` | 1 imagen | `image` | Imagen a malla, con textura, PBR, esqueleto y animación opcionales |
| `multi_image_to_3d` | 1–4 imágenes del mismo objeto | `image` | Más vistas, mejor geometría |
| `sam_3_3d` | 1 imagen | `image` | Levantar un objeto concreto de una foto; acepta `prompt` |
| `3d_rigging` | `model_url` (sin `medias`) | — | Esqueleto y animación sobre un GLB existente |

### Parámetros de `image_to_3d` y `multi_image_to_3d`

| Parámetro | Qué hace |
|---|---|
| `should_texture` | Textura. Por defecto `false`; activarla cuesta más |
| `enable_pbr` | Mapas PBR (metal, rugosidad, normal). Requiere `should_texture` |
| `texture_prompt` | Texto que guía la textura. Requiere `should_texture` |
| `texture_image_url` | Imagen de referencia de estilo para la textura. Requiere `should_texture` |
| `enable_rigging` | Esqueleto humanoide. Suma costo. Flojo en no bípedos |
| `rigging_height_meters` | Altura real aproximada, 1.7 por defecto |
| `pose_mode` | `a-pose` o `t-pose`; recomendado con esqueleto |
| `enable_animation` | Aplica un clip. Requiere `enable_rigging`. Suma costo |
| `animation_action_id` | Id entero 0–696 del catálogo `animation_actions`. Obligatorio con animación |
| `should_remesh` | Retopología (por defecto sí). En `false` devuelve la malla cruda |
| `target_polycount` | 100–300 000 triángulos, 30 000 por defecto |
| `topology` | `triangle` (por defecto) o `quad` |
| `symmetry_mode` | `auto` (por defecto), `on`, `off` |
| `seed` | Semilla para repetir un resultado |

### Parámetros de `sam_3_3d`

`detection_threshold` (0–1, más alto = detección más estricta), `export_textured_glb` (por defecto `true`; `false` da malla blanca), `seed`.

### Parámetros de `3d_rigging`

`model_url` (obligatorio, URL pública HTTPS de un GLB, sin credenciales), `height_meters`, `enable_animation`, `animation_action_id`.

## El resto del catálogo

| Modelo | Qué hace |
|---|---|
| `meshy_v7_image_to_3d` | Imagen a 3D de Meshy 7; `model_type` `standard`/`lowpoly`, `ultra_mode` para más detalle; textura activada por defecto |
| `tripo_h3_1_image_to_3d` | Imagen a GLB con Tripo H3.1; `texture_quality` y `geometry_quality` `standard`/`detailed` |
| `tripo_h3_1_multiview_to_3d` | De 2 a 4 vistas **ordenadas** a GLB |
| `tripo_p2_image_to_3d` | Imagen a 3D; la salida puede ser GLB o FBX |
| `hunyuan3d_v3_image_to_3d` | Una imagen o varias vistas; `generate_type` `Normal`, `LowPoly` o `Geometry` |
| `sam_3_3d_body` | Forma y pose de un cuerpo humano desde una imagen |
| `tripo_3d` | Texto a 3D |
| `meshy_v6_text_to_3d` | Texto a 3D; `mode` `preview` (solo geometría) o `full` (con textura) |
| `hunyuan3d_v3_1_text_to_3d` | Texto a 3D; `mode` `std` o `pro` |
| `meshy_v5_remesh` | Remalla un modelo existente (`model_url`); `target_polycount`, `topology` |
| `meshy_v5_retexture` | Retexturiza un modelo existente (`model_url`) con `text_style_prompt` o `image_style_url` |

También aparecen `meshy_image_to_3d`, `meshy_multi_image_to_3d` y `meshy_rigging`, con los mismos parámetros que `image_to_3d`, `multi_image_to_3d` y `3d_rigging`.

Dos cosas que hay que comprobar en vivo antes de usarlas:

- **El rol de `medias`.** Los modelos de Tripo, Hunyuan, `sam_3_3d_body` y `meshy_v7_image_to_3d` anuncian el rol `image_references`, no `image`. Si lo pasas mal, el servidor puede corregirlo y avisar en `adjustments`.
- **Texto a 3D.** El esquema de `generate_3d` dice que solo `sam_3_3d` acepta `prompt`, pero el catálogo lista modelos de texto a 3D. Antes de prometerlo, mira el modelo con `models_explore` `action: "get"` y haz un `get_cost: true`.

## Catálogo de animaciones

`animation_actions` (solo lectura, no crea trabajos).

| Parámetro | Uso |
|---|---|
| `query` | Busca en nombre y categoría: "walk", "sword attack" |
| `group` | `WalkAndRun`, `BodyMovements`, `DailyActions`, `Dancing`, `Fighting` |
| `category` | `Walking`, `Running`, `Jumping`, `Idle`, `Dancing`, `Punching`, `Climbing`, `Swimming`… (la lista viene en `categories`) |
| `limit` | 20 por defecto, máximo 100 |
| `after` | `next_page_token` de la página anterior |

Devuelve `id`, `name`, `group`, `category`, `preview_url` y `total_matched`. Los `preview_url` son GIF: muéstralos como imagen cuando haya varias opciones parecidas.

Ids frecuentes: `0` Idle, `30` Casual_Walk, `16` RunFast, `466` Regular_Jump, `28` Big_Wave_Hello, `64` All_Night_Dance.

## Subir un GLB para `model_url`

1. `media_upload` con un nombre que termine en `.glb`. Devuelve `upload_url` y `url`.
2. PUT de los bytes a `upload_url`.
3. `media_confirm` con `type: "file"`.
4. Pasa **`url`** como `model_url`. La `upload_url` es de un solo uso y no sirve.
