---
name: editar
description: Trabaja sobre material que ya existe en Higgsfield, sin generar de cero. Sube de resolución fotos y videos, amplía el lienzo de una imagen, pasa un video a vertical u horizontal, quita fondos, recalca un movimiento sobre un personaje, corta y une clips, pone música o subtítulos, corrige color y cambia la luz de un video. Úsala si dices "súbele la calidad", "pásalo a 4K", "hazlo vertical", "pásalo a 9:16", "amplía el fondo", "quítale el fondo", "une estos clips", "ponle subtítulos", "ponle música", "dale look de película", "cámbiale la luz" o "recorta este video". EN: upscale, outpaint, reframe, remove background, montage, captions, color grade and relight existing media on Higgsfield.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Editar: trabajar sobre lo que ya tienes

Carga antes la skill `estudio`: ahí están la conexión, la subida de archivos, el costo y la espera. Aquí solo va lo propio de editar material existente. Todas estas herramientas reciben un `media_id` (archivo subido y confirmado) o un `job_id` (resultado anterior); ninguna usa `prompt` ni `count`. Pedir la edición ya es la autorización: mides, dices el costo si se puede consultar y lanzas.

## Cuándo se activa

- Hay un archivo o una generación previa y quieren **mejorarlo, reencuadrarlo, recortarlo o montarlo**.
- Quieren un video terminado a partir de clips sueltos, con música o subtítulos.
- Quieren corregir color o cambiar la iluminación de un video sin cambiar lo que pasa en él.

Si lo que piden es cambiar el contenido (otra persona, otro producto, otro estilo), eso es generación: ve a `imagen`, `video` o `animar`.

## Qué herramienta para qué

| Piden | Herramienta | Costo antes de lanzar |
|---|---|---|
| Subir una imagen a 2K o 4K | `upscale_image` | `get_cost: true` (costo fijo) |
| Subir o restaurar un video | `upscale_video` | no se puede consultar |
| Ampliar el lienzo de una imagen | `outpaint_image` | `get_cost: true` |
| Cambiar la proporción de un video | `reframe` | `get_cost: true` |
| Quitar el fondo (imagen o video) | `remove_background` | no se puede consultar |
| Un personaje fijo que copia un video guía | `motion_control` | no se puede consultar |
| Cortar, unir, convertir, superponer | `sandbox_exec` (ffmpeg en la nube) | sin créditos de generación |
| Montaje, música, subtítulos quemados | flujo `video-montage` | el montaje no genera |
| Motion graphics, títulos animados, capas | flujo `video-editing` | el montaje no genera |
| Igualar color a una referencia o look de cine | comando `/color-grade` | no genera nada de pago |
| Cambiar la luz de un video | comando `/<look>-hf` (flujo `lighting-hf`) | una generación por clip |

Donde no hay consulta de costo, dilo en una línea ("este paso no deja consultar el precio antes") y sigue; el gasto real sale en `transactions`.

## Procedimiento

1. **Ten el id.** Archivo local o URL: súbelo como dice `estudio`. Resultado anterior: usa su `job_id`.
2. **Mide el original.** `upscale_image` y el proveedor `bytedance` de `upscale_video` exigen el ancho y alto reales en píxeles; `reframe` necesita la duración. Sácalos con `ffprobe` (en tu máquina si tienes el archivo, o en `sandbox_exec` descargándolo). No los inventes: el servidor no los deduce.
3. **Consulta el costo** donde exista `get_cost` y dilo en una línea.
4. **Lanza** con los parámetros de abajo, dentro de `params`.
5. **Espera y entrega** como dice `estudio`. Si la respuesta trae `job_id`, va a `jobs_wait`.

### Parámetros que importan

- **`upscale_image`**: `image_id`, `width`, `height` (del original), `resolution` `2k` o `4k` (por defecto `4k`).
- **`upscale_video`**, dos proveedores:
  - `provider: "bytedance"`: `video_id`, `width`, `height`, `resolution` `1080p`/`2k`/`4k`, `fps` 24/30/60 (más de 30 duplica el costo) y `preset` según el material: `common`, `aigc` (video generado por IA), `ugc`, `short_series`, `old_film` (restaurar metraje viejo).
  - `provider: "topaz"`: `video_id`, `resolution` `1080p` o `2160p` (4K), `aspect_ratio` (`auto` conserva el original). No pide dimensiones.
- **`outpaint_image`**: `image_id` y `aspect_ratio`. Ojo: si lo omites, el valor por defecto es `21:9`. Pásalo siempre (`auto`, `1:1`, `4:5`, `9:16`, `16:9`…). `width` y `height` van juntos o no van.
- **`reframe`**: `medias` con **un** video (`role: "video"`) y `aspect_ratio` (`16:9`, `9:16`, `4:3`, `3:4`, `1:1`, `21:9`). Opcional: una `start_image` y una o dos imágenes `image` que guían el relleno.
- **`remove_background`**: `media_id` y `media_type` (`image` o `video`). Nada más.
- **`motion_control`**: `image_id` (el personaje), `motion_video_id` (el video guía), `resolution` `720p` o `1080p`, `scene_control` `image` o `video` (de dónde sale el fondo).

### `reframe` en videos de más de 15 segundos

| Duración | Qué exige el servidor |
|---|---|
| Hasta 15 s | `resolution` opcional; si falta, conserva la del original |
| Más de 15 s y hasta 60 s | `resolution` y `duration_seconds` obligatorios, y **solo** el video en `medias` (sin imágenes guía) |
| Más de 60 s | No lo acepta. Corta en tramos con `sandbox_exec` y reencuadra cada uno |

Para consultar el costo: `get_cost: true` con `duration_seconds` y `resolution`; no hace falta `medias`.

### `motion_control`: cuándo sí

Es el recalco clásico de Kling 3.0: **un** personaje en una imagen fija sigue el movimiento y la cámara de un video guía. Úsalo solo si piden eso tal cual. Para transferir movimiento en general, varios personajes o reemplazar un objeto, el servidor manda por `generate_video`: eso lo lleva `animar`.

## Edición en la nube

Cortar, unir, convertir, extraer un fotograma o mezclar audio se hace con `sandbox_exec`: una máquina Linux de Higgsfield con ffmpeg, no la computadora de la persona. Tiempos, modo de fondo y la forma exacta de subir lo que produces están en `references/sandbox.md`. Si estás en Claude Code y el archivo es local, un corte simple puedes hacerlo con el ffmpeg local; usa el sandbox cuando el flujo del servidor lo pida o cuando el material ya vive en Higgsfield.

Los flujos del servidor (`video-montage`, `video-editing`, `color-grade`, `lighting-hf`) se cargan en vivo con `get_workflow_instructions` y mandan sobre lo que diga esta skill. Resumen de cada uno en `references/flujos.md`.

## Errores comunes

- **Pasar las dimensiones del resultado en vez de las del original.** `width` y `height` son las del archivo de entrada.
- **Olvidar `aspect_ratio` en `outpaint_image`** y recibir un 21:9 que nadie pidió.
- **Imágenes guía en un `reframe` largo.** Por encima de 15 s solo entra el video.
- **Pasar una ruta del sandbox a una herramienta de subida.** El sandbox sube con `curl` a la `upload_url`; no hay otra vía.
- **Esperar audio en un cambio de luz.** El resultado sale mudo: el flujo devuelve el audio original en un paso aparte.
- **Reenviar tras un timeout.** Mira `show_generations` antes; puede haberse lanzado.
- **Prometer que el montaje "no cuesta nada".** El sandbox no genera, pero un cambio de luz o un upscale sí gastan.

## A dónde ir

| Quieren | Skill |
|---|---|
| Cambiar lo que se ve (persona, producto, estilo) | `imagen`, `video` |
| Animar una foto o copiar un movimiento | `animar` |
| Doblar, cambiar la voz, música nueva | `audio` |
| Publicar el video terminado en TikTok | `publicar` |
| Saber por qué funciona o no un video | `analizar` |
