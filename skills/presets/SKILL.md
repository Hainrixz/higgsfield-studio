---
name: presets
description: Plantillas, efectos y comandos listos de Higgsfield. Navega las galerías (efectos virales, Marketing Studio, Genjutsu, estilos Soul, Recraft, Katana, What If, Shorts Studio), resuelve comandos con barra como /genjutsu, /katana, /shorts, /content-factory o /hero-shot, y ejecuta una plantilla cuando lo pides. Úsala si dices "enséñame los efectos virales", "qué plantillas hay", "aplica el efecto X a mi foto", "el trend de…", "ponle este estilo a mi video", "hazme un edit tipo Katana", "un short con presentador", "un video what if", "estilos para un video explicativo" o si escribes un comando con barra. EN: browse and run Higgsfield presets, viral effects and slash recipes.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Presets: lo que ya viene armado

Carga antes la skill `estudio`. Aquí va lo propio: qué galería abrir, cómo se resuelve un comando con barra y cuándo se puede ejecutar una plantilla.

Dos herramientas hacen casi todo y no son intercambiables:

| Herramienta | Para |
|---|---|
| `get_presets` | **Ver** galerías y abrir la ficha de una plantilla |
| `get_preset_instructions` | **Leer** la receta de un comando con barra, sin ejecutar nada |

**Regla del servidor: mirar nunca autoriza a ejecutar.** Abrir una galería, previsualizar una plantilla o escribir un comando a secas solo abre su widget. `execute_preset` va únicamente cuando la persona pide generar con esa plantilla.

## Cuándo se activa

- Piden ver, buscar o elegir efectos, plantillas, estilos o trends.
- Escriben un comando con barra, o nombran una plantilla o un efecto por su nombre.
- Piden un formato de comando: edit Katana, reel de Shorts Studio, video What If, estilo de explicativo.

## Qué galería

| Piden | `source` | Notas |
|---|---|---|
| Efectos virales, `/effects` | `viral` | Cadenas de efectos sobre una foto |
| Plantillas de producto, `/product` | `marketing_studio`, `category: "product-shot"` | Lo usa `producto` |
| Plantillas de movimiento, `/motion` | `marketing_studio`, `category: "motion"` | |
| Movimientos Genjutsu, `/genjutsu` | `genjutsu` | `category`: `genjutsu`, `genjutsu-trending`, `genjutsu-new`, `genjutsu-styles` |
| Estilos de retrato Soul | `soul` | No se ejecuta: da un `style_id` |
| Mis estilos de Recraft | `recraft` | No se ejecuta: da un `style_id` |
| Edits Katana, `/katana` a secas | `katana` | Catálogo para la persona; sin `query` |
| Estilos What If, `/content-factory` a secas | `what_if` | Sin filtros |
| Presets de Shorts Studio, `/shorts` a secas | `shorts_studio` | Sin filtros |
| "Lo popular" sin más | sin `source` | Mezcla virales y Marketing Studio |

Parámetros, paginación y qué devuelve cada galería: `references/galerias.md`.

## Procedimiento: plantilla de galería

1. **Navega:** `get_presets` con `source` (y `category` o `query`). Si solo querían ver, **paras aquí**.
2. **Sube** lo que la persona ya dio, como dice `estudio`. No asumas que una foto sirve para todos los huecos ni adivines cuál va dónde.
3. **Abre la ficha, una sola vez:** `get_presets` con `source`, `preset_id` e `initial_inputs` en los campos exactos de `execution.input_schema`. Lo que falte se deja para que lo complete la persona en el widget. No abras la ficha solo para leer el esquema ni la reabras para repetir valores por defecto.
4. **Si pidieron generar:** revisa `execution.available` (dice si se puede, no si tienes permiso) y `execution.readiness` (si falta o sobra algo, se pide; no se envía). Di el precio si la ficha lo trae.
5. `execute_preset` con `source`, `preset_id` e `inputs`. Solo vale para `viral`, `marketing_studio` y `genjutsu`.
6. **Muestra:** un trabajo, `job_display`; varios, `jobs_wait` y un `show_generation_by_ids`.

Si el widget avisa que ya envió trabajos (la persona pulsó Recreate), **no ejecutes otra vez**: espera y muestra esos ids.

## Procedimiento: comando con barra

1. `get_preset_instructions` con `{ preset: "/<comando>" }` **antes** de elegir herramientas o pedir archivos. Sin `preset`, lista recetas y comandos.
2. Sigue lo que devuelva. Es la receta del servidor y gana a cualquier workflow de nombre parecido.
3. Un comando desconocido con emoji devuelve opciones: se le dan a la persona, no se adivina el efecto. Un `/katana/<slug>` o `/shorts/<slug>` que no existe se detiene; no se sustituye por otro.

| Comando | Qué es | A secas hace | Resumen |
|---|---|---|---|
| Recetas de imagen o video (`/hero-shot`, `/product-spin`…) | Un prompt maestro con parámetros fijos | Pide la foto | Se genera directo, sin plan ni confirmación |
| `/genjutsu` | Transferir movimiento, reemplazar un objeto, estilos de video | Abre la galería | `references/comandos.md` |
| `/katana` | Edit o remix de video a partir de una referencia | Abre el catálogo | `references/comandos.md` |
| `/shorts` | Reel vertical con un presentador de IA | Abre la galería | `references/comandos.md` |
| `/content-factory` | Video "what if" dibujado con código, con voz en off | Abre la galería | `references/comandos.md` |
| `/drama-ads` | Micro-drama publicitario | Abre su catálogo | Skill `anuncios` |
| `/3d-jutsu` | Escenas 3D alojadas | — | Skill `tres-d` |

Pedir la producción con un comando y un tema **es** la petición de generar. `/shorts` y `/katana` están escritos para correr de corrido: dicen el costo estimado en una línea y siguen, sin esperar respuesta. No les añadas paradas.

## Estilos que no se ejecutan

- **Soul:** el `id` del estilo va como `style_id` a `generate_image` con `model: "soul_2"`. Se combina con `soul_id`, no con imágenes de referencia.
- **Recraft:** el `id` va como `style_id` con `model: "recraft_v4_styles"`. Son los estilos guardados de la persona; si el catálogo sale vacío, no hay ninguno listo y no se sustituye por uno general.
- **Explicativos:** `get_explainer_presets` lista los estilos; `resolve_explainer_preset` (con `preset_id` o `preset_name`) devuelve un `media_id` que se pasa como referencia de estilo en **cada** escena.

## Decisiones rápidas

| Situación | Qué haces |
|---|---|
| "¿Qué efectos hay?" | Galería y fin |
| "Aplícale el efecto X a esta foto" | Sube, abre ficha con `initial_inputs`, comprueba, `execute_preset` |
| "Lo más popular de Genjutsu" | `category: "genjutsu-trending"`, respetando el orden que devuelve |
| "Copia este baile en mi personaje" (con su video) | No es plantilla: `generate_video` con `hf_mult_motion_control`. Lo lleva `animar` |
| "Un edit Katana del estilo tal" | `get_preset_instructions` sin `preset`, elige por título y descripción, y carga su `/katana/<slug>` exacto |
| Falta una entrada obligatoria | Se pide; no se envía a medias |

## Errores comunes

- Llamar a `execute_preset` porque la galería "ya está abierta" o porque `execution.available` es verdadero.
- Usar `execute_preset` con un estilo Soul, Recraft o un preset Katana.
- Inventar un `preset_id` o un `source`. Salen de `get_presets`.
- Buscar con `query` en Katana. No lo admite: se descubre con `get_preset_instructions`.
- Abrir `what_if` o `shorts_studio` cuando ya dieron el tema. Esas galerías son solo para el comando a secas.
- Crear la sesión de Katana (`get_katana_config`) solo por leer instrucciones o mirar. Crea estado; va cuando de verdad arranca una corrida.
- Registrar un resultado con una URL, una ruta local o un `job_id`. Los `register_*` solo aceptan el `media_id` del video final confirmado.

## A dónde seguir

| Quieren | Skill |
|---|---|
| Mover una imagen o copiar un movimiento con su propio video | `animar` |
| Plantillas de producto | `producto` |
| Micro-drama o variantes de un anuncio | `anuncios` |
| Presentador fijo para sus reels | `personajes` |
| Escenas 3D | `tres-d` |
| Publicar el resultado | `publicar` |
