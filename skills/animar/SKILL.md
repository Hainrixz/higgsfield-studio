---
name: animar
description: Da movimiento a algo que ya existe con Higgsfield. Anima una foto, va de un fotograma a otro, copia a tu personaje el movimiento de otro video (Genjutsu), cambia un objeto o producto dentro de un video, convierte un dibujo en video, hace hablar a una foto con un audio y deja el resultado en vertical. Úsala si dices "anima esta imagen", "dale vida a esta foto", "que la cámara se acerque", "pásalo a video", "que se mueva igual que este video", "cópiale el baile", "transfiere el movimiento", "cambia el producto de este video por el mío", "haz que esta foto hable", "anima mi dibujo", "genjutsu" o "pásalo a 9:16". EN: image-to-video, start/end frames, Genjutsu motion transfer and object replacement, draw-to-video, talking head, 9:16 reframing on Higgsfield.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Animar

Aquí el punto de partida no es un texto: es una imagen o un video que ya existe, y el trabajo es moverlo sin romperlo. Casi todo pasa por `generate_video` con el modelo adecuado. Carga antes la skill `estudio` (subir los archivos, costo, espera y entrega son suyos). Cómo se escribe un prompt de movimiento está en `references/movimiento.md`: léelo antes del primer prompt.

## Cuándo se activa

- Hay una foto, un render o una imagen recién generada y quieren verla moverse.
- Hay un video guía y quieren ese movimiento en su personaje o su producto.
- Hay un video y quieren cambiarle un objeto, una prenda o un personaje.
- Hay una foto y un audio y quieren que la foto hable.
- Hay un video horizontal y lo necesitan vertical.

Si no hay ningún archivo de partida, es `video`.

## Procedimiento

1. **Ten los archivos como id.** Imagen o video local: súbelo como dice `estudio`. Algo que acabas de generar: su `job_id` sirve tal cual en `medias[].value`.
2. **Elige la ruta** en la tabla de abajo.
3. **Mira el modelo** con `models_explore` (`action: "get"`) si vas a usar un parámetro o un rol que no esté en esta página.
4. **Escribe el prompt en inglés y solo del movimiento:** cámara, un gesto del sujeto, ambiente. No vuelvas a describir la escena.
5. **Formato:** `aspect_ratio` explícito donde el modelo lo tenga, y la duración más corta que sirva (3 a 5 s para un plano).
6. **Costo, lanzar, esperar, entregar** como dice `estudio`: en video se consulta con `get_cost: true`, se dice en una línea y se sigue.
7. **Revisa antes de entregar:** forma del producto, manos, ojos, que el movimiento no vaya y vuelva. Si falló, cambia el prompt y reintenta una vez.

## Rutas

| Piden | Ruta |
|---|---|
| Animar una foto | `generate_video`, la foto con rol `start_image` |
| Ir de una foto a otra | `generate_video`, `start_image` + `end_image` |
| Copiar movimiento, baile, gestos o cámara de un video | `generate_video` con `model: "hf_mult_motion_control"` |
| Cambiar objeto, producto, prenda o personaje de un video | `generate_video` con `model: "hf_mult_replace_object"` |
| Elegir un movimiento de la galería | `get_presets` con `source: "genjutsu"` |
| Dibujo o boceto a video | `generate_video` con `model: "draw_to_video"` |
| Que una foto hable con un audio | `generate_video` con `model: "intone"` |
| Pasar a vertical un video ya hecho | `reframe` |

## Animar una foto

| Modelo | Cuándo | Límites |
|---|---|---|
| `seedance_2_5` | Por defecto | 4–30 s; sonido encendido salvo `generate_audio: false` |
| `kling3_0` | Movimiento con física, o fotograma inicial y final | 3–15 s; `16:9`, `9:16`, `1:1` |
| `minimax_h3` | Tiene que salir muy nítido (2K) | 4–15 s |
| `veo3_1` | Realismo de cine | 4, 6 u 8 s; solo fotograma inicial |
| `kling3_0_turbo`, `veo3_1_lite` | Pruebas rápidas y baratas | — |

Una foto animada casi nunca necesita sonido: apágalo (`generate_audio: false`, o `sound: "off"` en Kling). El resto de modelos y sus parámetros están en la skill `video`.

## Genjutsu: copiar un movimiento o cambiar un objeto

Los dos son modelos de `generate_video`, no herramientas aparte:

- `medias`: las imágenes de referencia (tu personaje, tu producto) con rol `image` y **exactamente un** video con rol `video` (el guía, o el que se va a modificar). Así lo piden las instrucciones del servidor; el catálogo llama a esos mismos roles `image_references` y `video_references`. Cuando el rol es evidente el servidor lo corrige y lo avisa en `adjustments`.
- `prompt`: lo que pidió la persona, en inglés. `resolution`: `480p`, `720p` (por defecto) o `1080p`.
- Variantes ligeras: `hf_mult_motion_control_flash` (hasta 15 s) y `hf_mult_replace_object_flash`.
- Nunca uses como referencia el personaje del ejemplo de la galería: siempre las imágenes de la persona. Sin imagen de referencia no hay transferencia; dilo y ofrece generarla con `imagen`.

Si la persona escribe `/genjutsu` o quiere elegir un movimiento ya hecho: `get_preset_instructions` con `preset: "/genjutsu"` y sigue lo que diga. La galería (`get_presets` con `source: "genjutsu"` y `category` `genjutsu`, `genjutsu-trending`, `genjutsu-new` o `genjutsu-styles`) recoge las referencias y genera desde su propio visor: no lances una segunda generación por tu cuenta. Los estilos que redibujan un video entero los lleva `presets`.

**Plan B:** `motion_control` (`image_id`, `motion_video_id`, `resolution`, `scene_control`) es el recast antiguo de Kling para un solo personaje, sin prompt. Solo si Genjutsu no sirve para el caso o la persona lo pide por nombre.

## Que una foto hable

`intone` está en el catálogo (noviembre 2026): uno o dos personajes dicen de una a seis grabaciones de voz, mirando a cámara o entre ellos.

1. Consigue el audio: el que subió la persona o uno generado con `audio`.
2. `generate_video` con `model: "intone"` y en `medias`: la foto con rol `character_images`, cada audio con rol `audio_references` y, si quieren un lugar concreto, una imagen con rol `location_image`.
3. Las voces deben sumar entre 2 y 30 s; el video dura eso más unos 2,5 s. `resolution` por defecto `1080p`.

Si lo que hay es un video y quieren cambiarle lo que dice, es sincronización de labios o doblaje: `audio`. Si es un creador hablando de un producto, `ugc`.

## Dibujo a video

`draw_to_video` existe en el catálogo sin descripción. Lo comprobado: roles `video`, `image_references` y `ref_image`; parámetros `duration`, `resolution`, `generate_audio` (apagado por defecto) y `enhancer` (mejora el prompt, encendido por defecto). Antes de usarlo, confírmalo con `models_explore` y prueba con un clip corto.

## Pasar a vertical

Si el video aún no existe, genera directo en `9:16`. Si ya existe, `reframe`: el video en `medias` con rol `video` y `aspect_ratio: "9:16"`. Rellena los bordes en vez de recortar. Por encima de 15 s exige `resolution` y `duration_seconds`; el máximo son 60 s. Acepta `get_cost`. Más resolución o montaje: `editar`.

## Errores comunes

- **Redescribir la escena.** El modelo la rehace y pierdes el encuadre. Solo movimiento.
- **Dos videos en Genjutsu.** Admite uno. Elige el guía.
- **Empezar por `motion_control`.** Es el plan B.
- **Animar una imagen horizontal para Reels.** Genera o encuadra la imagen en vertical antes de animarla.
- **Pedir mucho movimiento a un producto.** Se deforma. Un acercamiento lento vende más.
- **Audio de 40 s en `intone`.** El tope son 30 s de voz: pártelo.
- **Repetir el mismo prompt tras un fallo.** Cambia algo y di qué.

## A dónde seguir

| Después quieren | Skill |
|---|---|
| Crear la imagen de partida | `imagen` |
| Un clip desde texto, varias tomas | `video` |
| La voz, el doblaje, los labios | `audio` |
| Escalar, montar, subtitular | `editar` |
| Efectos y plantillas de la galería | `presets` |
| Un personaje que se repita | `personajes` |
| Publicarlo | `publicar` |
