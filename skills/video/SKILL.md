---
name: video
description: Genera video con Higgsfield desde una descripción. Un clip suelto, varias tomas en un mismo clip, video con fotograma inicial y final, extender o editar un clip, borrador barato antes del final, y tandas de clips. Elige el modelo (Seedance, Kling, MiniMax, Veo, Cinema Studio) según lo que pidan y lleva a los flujos de video sin rostro, narración y efectos para reels. Úsala si dices "hazme un video de…", "genera un clip", "un video de 10 segundos", "en vertical para Reels", "con varias tomas", "que empiece así y termine así", "alarga este video", "un video narrado", "un canal sin rostro", "un explicativo animado", "ponle texto detrás al reel" o "hazlo con Veo / Kling / Seedance". EN: text-to-video, multi-shot, start/end frames, model choice, draft-then-final, faceless and narrated video on Higgsfield.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Video

Video desde texto: `generate_video` para un clip, `generate_video_batch` para varios distintos. Carga antes la skill `estudio`; aquí solo va lo propio de video. Si el punto de partida es una imagen o un video que ya existe, la skill es `animar`.

## Cuándo se activa

- Piden un clip desde una descripción, con o sin sonido.
- Piden varias tomas, o un clip que vaya de un fotograma a otro.
- Piden alargar o retocar con texto un clip ya generado.
- Piden un video terminado de varias escenas: narrado, explicativo, de canal sin rostro.
- Piden un efecto de edición sobre su reel hablado (texto detrás, subtítulos animados, tier list).

## Procedimiento

1. **¿Un clip o una producción?** Un clip se hace directo (paso 2). Si es un video de varios pasos (varias escenas montadas, narración, subtítulos), llama primero a `get_workflow_instructions` **sin argumento**: devuelve los flujos del servidor y cuándo toca cada uno. Carga el que corresponda con `workflow: "<nombre>"` y síguelo al pie de la letra. Los tres de esta skill:

   | Piden | Flujo | Ojo |
   |---|---|---|
   | Canal sin rostro, explicativo narrado, historia, documental, cuento, canción infantil | `faceless-video` | Solo si lo piden así. Un tema suelto ("un video sobre Roma") es un clip normal |
   | Tomas de voz ajustadas a ventanas fijas, una lectura larga continua, o "ponme a mí narrando este video" | `narration` | No es para leer un texto en voz alta: eso es `audio` |
   | `/text-behind`, `/captions`, `/tier-list`, `/freeze-frame`, `/grade-wipe`, `/katana-…` sobre un clip hablado | `reel-effects` | Entra por el comando: resuélvelo con `get_preset_instructions` y él te manda al flujo |

   Resumen de cada uno en `references/flujos.md`. Los tres necesitan `sandbox_exec`.

2. **Elige el modelo.** Si nombraron uno, es ese.

   | Para | Modelo | Duración | Lo que lo distingue |
   |---|---|---|---|
   | Video general | `seedance_2_5` | 4–30 s | Sonido incluido, borrador barato, extender y editar |
   | Varias tomas, sonido sincronizado | `kling3_0` | 3–15 s | Calidad `std`, `pro` o `4k`; fotograma inicial y final |
   | Fotogramas clave en 2K, referencias mezcladas | `minimax_h3` | 4–15 s | Sale siempre en 2K |
   | Realismo de cine | `veo3_1` | 4, 6 u 8 s | Solo `16:9` y `9:16` |
   | Control de cámara, luz y género | `cinematic_studio_video_4_0` | 4–30 s | Controles de cine por id |
   | Clips baratos en cantidad | `veo3_1_lite`, `kling3_0_turbo` | — | Para tandas y pruebas |
   | Anuncio o producto | `marketing_studio_video` | — | Lo lleva `anuncios` |

   Detalle y parámetros en `references/modelos.md`. Para lo demás: `models_explore` con `action: "recommend"`.

3. **Fija formato antes de lanzar.** `aspect_ratio` explícito siempre (`9:16` para Reels, TikTok y Shorts; `16:9` para YouTube). `duration` en segundos enteros dentro del rango del modelo. `resolution` donde exista (`720p` suele ser el valor por defecto). Si pides algo que el modelo no admite, el servidor lo ajusta al valor más cercano y lo devuelve en `adjustments`: dilo al entregar.

4. **Escribe el prompt en inglés.** Sujeto, acción, cámara, luz, ambiente; una idea por toma. Si hay diálogo, entre comillas y en el idioma en que se debe oír.

5. **Sonido.** Cada modelo lo llama distinto: `generate_audio` (verdadero o falso) en Seedance, Veo Lite y Cinema Studio; `sound` (`"on"` o `"off"`) en Kling. Varios lo traen encendido por defecto; apágalo si van a poner música o voz encima, que además baja el costo.

6. **Costo, lanzar, esperar, entregar** como dice `estudio`: en video se consulta con `get_cost: true`, se dice en una línea y se sigue.

## Borrador y final

Solo `seedance_2_5` lo tiene (noviembre 2026):

1. `draft: true` genera un borrador en 480p, más barato.
2. Si convence, otra llamada con `draft_job_id: "<job del borrador>"` lo rinde en 1080p. Se cobra la duración completa del borrador y `duration` se ignora. Hay siete días para finalizarlo.

Úsalo cuando el clip es largo, cuando el prompt es incierto o cuando la persona pide "una prueba". Si pidió el video final sin más, genera el final directo.

## Varias tomas

- **Con lista de tomas:** `kling_o3_flf` (o `kling_o3_image_reference` si hay imágenes de referencia) con `multi_shots: true` y `multi_prompt`, una lista ordenada de `{ "prompt": "...", "duration": 3 }`.
- **Sin lista:** `kling3_0` o `seedance_2_5` con las tomas descritas en el prompt, en orden ("Shot 1: … Shot 2: …").
- **Tomas que luego se montan:** una por elemento en `generate_video_batch` y el montaje lo hace `editar`.

## Fotograma inicial y final

Roles `start_image` y `end_image` en `medias`. Aceptan los dos: `seedance_2_5`, `kling3_0`, `kling_o3_flf`, `minimax_h3`, `veo3_1_lite`. `veo3_1` solo acepta el inicial. Si lo único que hay es una foto que animar, la ruta completa está en `animar`.

## Extender y editar un clip

En `seedance_2_5`, con el clip en `medias` (rol `video_references`):

- **Alargar:** `mode: "video_extension"` y `extension_mode` (`"forward"` o `"backward"`). La proporción la hereda del clip.
- **Editar con texto:** `mode: "video_edit"`. Se cobra por la duración del clip; `duration` y `aspect_ratio` se ignoran.

## Tandas

`generate_video_batch`: de 1 a 12 elementos en `requests[]`, cada uno con `index` y `params`. Sin `count` y sin `get_cost`: para el costo, consulta un clip representativo con `generate_video` y multiplica. Espera en grupos con `jobs_wait` y enseña todo con un solo `show_generation_by_ids`.

## Errores comunes

- **No pasar `aspect_ratio`.** Sale horizontal y luego hay que arreglarlo con `reframe`.
- **Pedir 10 s a Veo.** Solo hace 4, 6 u 8. El servidor lo recorta y avisa.
- **Reenviar tras un timeout.** Un video tarda minutos. Sigue esperando con `jobs_wait`; reenviar cobra doble.
- **Meter tres ideas en una toma.** Una acción y un movimiento de cámara por toma.
- **Usar `faceless-video` por tener un tema.** Ese flujo es para un video narrado de canal y hace sus propias preguntas de arranque.
- **Tratar un borrador como final.** El borrador es 480p: finalízalo con `draft_job_id`.
- **Dejar el sonido encendido cuando van a doblar o musicalizar.** Apágalo.

## A dónde seguir

| Después quieren | Skill |
|---|---|
| Partir de una foto, copiar un movimiento, cambiar un objeto | `animar` |
| Voz, música, doblaje, sincronizar labios | `audio` |
| Vertical, más resolución, montar clips, subtítulos | `editar` |
| Una persona hablando a cámara de un producto | `ugc` |
| Anuncios | `anuncios` |
| Miniatura para el video | `imagen` |
| Subirlo a TikTok | `publicar` |
| Saber si va a funcionar | `analizar` |
