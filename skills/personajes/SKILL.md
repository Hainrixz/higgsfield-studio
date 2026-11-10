---
name: personajes
description: Personajes que salen iguales en todas tus imágenes y videos con Higgsfield. Soul entrenado con tus fotos (gemelo digital), Elementos de referencia para personas, objetos y lugares, hojas de personaje, AI Influencer y su voz. Úsala si dices "quiero un avatar de mi marca", "que salga siempre la misma persona", "usa mi cara", "mi gemelo digital", "entrena un Soul con mis fotos", "guarda este personaje", "créame un influencer de IA", "una hoja de personaje", "un turnaround" o "ponle voz a mi avatar". EN: consistent characters (trained Soul, reference Elements, character sheets, AI Influencer, voice).
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Personajes: la misma cara cada vez

Carga antes la skill `estudio`. Aquí va lo propio: cuál de las cuatro formas de fijar una identidad conviene, cómo se llama a cada una y cómo se usa después al generar.

## Cuándo se activa

Cuando lo que importa es la **continuidad**: la misma persona, el mismo objeto o el mismo lugar en varias piezas. Un retrato suelto que no se va a repetir es `imagen`.

## Las cuatro rutas

| Ruta | Qué es | Cuándo |
|---|---|---|
| **Soul** | Modelo entrenado con 5 a 20 fotos de una persona | Una persona concreta, sola en el cuadro, máxima fidelidad |
| **Elemento** | Una imagen de referencia guardada con nombre | Todo lo demás: varios sujetos, objetos, lugares, una sola foto, resultado al momento |
| **AI Influencer** | Hoja de personaje inventado, armada por rasgos | Un personaje nuevo que no es nadie real |
| **Hoja de personaje** | Prompt por ranuras para varias vistas | Turnaround, hoja de expresiones, diseño 2D, 3D o de juego |

Detalle de Soul contra Elemento: `references/soul-vs-elemento.md`.

**Regla del servidor:** si piden "un avatar", "mi gemelo" o "usa mi cara" **sin dejar claro el camino**, no llames nada todavía. Ofrece las dos opciones en una línea (entrenar un Soul: una persona, 5 a 20 fotos, unos 10 minutos, solo modelos Soul; o guardar un Elemento: al momento, una imagen, varios sujetos, muchos modelos) y que elijan. Si ya mandaron 5 o más fotos de la misma persona o dijeron "entrena", eso ya es la elección.

## Soul: entrenar y usar

1. **Sube las fotos** como dice `estudio`. `show_characters` acepta `media_id`, ids de imágenes ya generadas o URLs https; rutas locales, nunca.
2. `show_characters` con `action: "train"`, `name` y las 5 a 20 imágenes en `images`. `type` es `soul_2` por defecto; usa `soul_cinematic` si lo van a generar con ese modelo.
3. Tarda unos 10 minutos y no bloquea: el widget se actualiza solo. Consulta con `action: "status"` y el `soul_id`, o lista los listos con `action: "list"`, `status: "ready"`.
4. **Usarlo:** `generate_image` con `model: "soul_2"` (o `soul_cinematic`) y `soul_id` dentro de `params`.

Entrenar solo se hace si lo pidieron o si llegaron las fotos: es regla del servidor y de `estudio`.

Límites que se descubren tarde si no se dicen: un Soul sirve **solo** con `soul_2` y `soul_cinematic`, y va **un** `soul_id` por generación. Dos personas en la misma toma son Elementos.

## Elemento: guardar y usar

1. Sube la imagen y guarda **las dos cosas** que devuelve la subida: el id y la URL https.
2. `manage_reference_elements` con `action: "create"` y `medias: [{ id, url, type }]` (`type` es `media_input` para un archivo subido o `image_job` para una imagen generada). `category: "auto"` salvo que pidan otra. `name` opcional, máximo 32 caracteres. Responde al momento.
3. **Usarlo:** escribe `<<<element_id>>>` dentro de `params.prompt` de `generate_image` o `generate_video`. Varios por prompt: `"<<<A>>> handing coffee to <<<B>>> in a Paris cafe"`.
4. Para verlos o elegir uno: `show_reference_elements` (widget) o `manage_reference_elements` con `action: "list"`.

No pongas el id del elemento en `medias`: el marcador ya inyecta la imagen. La forma `@nombre` no funciona en una llamada. Solo sirven los elementos en `status: completed`.

## AI Influencer

1. **Rasgos o ejemplo:** `ai_influencer_get_options` (grupos de rasgos y cuáles valen en cada `tier`), `ai_influencer_list_presets` (personajes de ejemplo con sus ajustes) o `ai_influencer_get_settings` con el `job_id` de una hoja que ya existe.
2. `ai_influencer_prepare` con lo que pidieron. Devuelve el diseño, los `params` exactos y el precio. No crea nada ni gasta.
3. Di diseño y precio en una línea y, si pidieron crear el personaje, **sigue**: `ai_influencer_generate` con esos `params` sin tocar y `max_credits` igual al precio cotizado (o al tope que te dieron, si es menor). Si solo pidieron verlo, paras en el paso 2.
4. El generador abre su propio visor. Espera con `jobs_wait`. No lo dupliques con otra herramienta de mostrar.
5. **No reintentes** un envío dudoso: repetir crea otra hoja y cobra otra vez.
6. Al terminar, **ofrece** animarlo con Genjutsu. Si aceptan y hay varias hojas, que digan cuál. Entonces `get_presets` con `source: "genjutsu"`, `category: "genjutsu"` e `initial_inputs: { character_sheet: [{ id: "<job_id>", type: "image_job" }] }`. Abrir esa galería no autoriza a generar el video: lo lanza la persona desde el widget.

Rasgos, `tier`, variantes y generaciones gratis: `references/ai-influencer.md`.

## Hoja de personaje

`get_workflow_instructions` con `{ workflow: "character-sheet" }`, solo cuando la piden con esas palabras (hoja de personaje, model sheet, turnaround, hoja de expresiones). Por defecto entrega **el prompt listo para pegar**; genera la imagen solo si dicen "genérala". Las dos cosas son reglas del servidor. Siempre personaje original: un famoso o un personaje con dueño sirve como aire general, nunca como parecido.

## Decisiones rápidas

| Situación | Ruta |
|---|---|
| "Yo, en 20 fotos distintas para mi marca" | Soul |
| "Mi producto y mi modelo en la misma foto" | Dos Elementos |
| "Mi personaje en un video" | Elemento con un modelo de video que los soporte (lista en `references/soul-vs-elemento.md`); con `kling3_0` hace falta además un `start_image` |
| "Solo tengo una foto" | Elemento |
| "Un personaje inventado, sin fotos" | AI Influencer, o `generate_image` con `soul_cast` para una identidad cinematográfica desde texto |
| "Que tenga siempre la misma voz" | `references/voz.md` |

## Errores comunes

- Entrenar un Soul y querer usarlo con un modelo que no es Soul.
- Crear un Elemento solo con el id, sin la URL: falla.
- Combinar `style_id` de Soul con una imagen de referencia: son incompatibles (sí se combina con `soul_id`).
- Cambiar los `params` entre `ai_influencer_prepare` y `ai_influencer_generate`, o volver a preparar "para confirmar": cada preparación con azar da otro diseño. Para repetir uno exacto, `randomize: false` y la misma `seed`.
- Pasar a generación de imagen genérica si AI Influencer no está disponible. Se dice y ya.
- Entrenar con fotos de alguien que no dio permiso, o de un famoso.

## A dónde seguir

| Quieren | Skill |
|---|---|
| Imágenes con el personaje ya fijado | `imagen` |
| Moverlo o copiarle un baile | `animar` |
| Que hable a cámara vendiendo algo | `ugc` |
| Clonar o elegir la voz | `audio` |
| Un reel con ese presentador | `presets` (comando `/shorts`) |
