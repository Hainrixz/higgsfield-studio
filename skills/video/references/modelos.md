# Modelos de video

Leído del catálogo en vivo (noviembre 2026): 60 modelos de tipo video, contando los de edición. Aquí están los que conviene conocer. Antes de usar un parámetro que no esté en esta página, `models_explore` con `action: "get"` y el `model_id`.

## Generación

| Modelo | Duración | Resolución | Proporciones | Roles de `medias` | Parámetros propios |
|---|---|---|---|---|---|
| `seedance_2_5` | 4–30 s (5) | `480p`, `720p`, `1080p` | `auto`, `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16` | `start_image`, `end_image`, `image_references`, `video_references`, `audio_references` | `mode` (`t2v`, `omni_reference`, `video_edit`, `video_extension`), `generate_audio`, `bitrate_mode`, `extension_mode`, `draft`, `draft_job_id` |
| `seedance_2_0` | 4–15 s (5) | `480p` a `4k` | Las mismas | Los mismos | `mode` (`std`, `fast`), `genre`, `generate_audio` |
| `kling3_0` | 3–15 s (5) | por `mode`: `std`, `pro`, `4k` | `16:9`, `9:16`, `1:1` | `start_image`, `end_image` | `sound` (`on`, `off`) |
| `kling_o3_flf` | 3–15 s (5) | `mode`: `std`, `pro`, `4k` | `16:9`, `9:16`, `1:1` | `start_image`, `end_image` | `sound`, `multi_shots`, `multi_prompt` |
| `kling_o3_image_reference` | 3–15 s (5) | `mode`: `std`, `pro`, `4k` | `16:9`, `9:16`, `1:1` | `image_references` (hasta siete) | `sound`, `multi_shots`, `multi_prompt` |
| `kling4_0` | 3–30 s (10) | `720p`, `1080p` | `21:9`, `16:9`, `9:16`, `1:1`, `auto` | `start_image`, `end_image`, `image_references`, `video_references` | `mode` (`text-to-video`, `image-to-video`, `reference-to-video`, `video-edit`) |
| `minimax_h3` | 4–15 s (5) | `2K` | `auto`, `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16` | `start_image`, `end_image`, `image_references`, `video_references`, `audio_references` | `batch_size` |
| `veo3_1` | 4, 6, 8 s (8) | por `quality`: `basic`, `high`, `ultra` | `16:9`, `9:16` | `start_image` | `variant` (`veo-3-1-fast`, `veo-3-1-preview`) |
| `veo3_1_lite` | 4, 6, 8 s (8) | — | `16:9`, `9:16`, `auto` | `start_image`, `end_image` | `generate_audio` (apagado por defecto) |
| `cinematic_studio_video_4_0` | 4–30 s (5) | `480p`, `720p`, `1080p` | Como Seedance 2.5 | Como Seedance 2.5 | Los de Seedance 2.5 (sin borrador) más `era_id`, `camera_model_id`, `camera_lens_id`, `camera_aperture_id`, `pacing_id`, `genre_id`, `light`, `light_custom`, `color_palette` |
| `cinematic_studio_3_0` | 4–15 s | hasta `4k` | `auto`, `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16` | `image`, `start_image`, `end_image` | `genre`, `generate_audio` (apagado por defecto) |
| `wan3_0` | 2–30 s (5) | `480p`, `720p`, `1080p` | `auto`, `16:9`, `9:16`, `1:1`, `4:3`, `3:4` | Los cinco | `generate_audio`, `enable_thinking` |
| `flux_3_video` | 5–20 s (5) | `720p` a `4k` | Incluye `2:1` | `start_image`, `end_image`, `image_references`, `video_references` | `generate_audio` |
| `kling3_0_turbo` | 3–15 s (5) | `720p`, `1080p` | `16:9`, `9:16`, `1:1` | `start_image` | — |

Entre paréntesis, la duración por defecto. Los ids de control de `cinematic_studio_video_4_0` (cámara, lente, época…) no se listan aquí: confírmalos con `models_explore` antes de usarlos, o describe la cámara y la luz en el prompt.

## Cómo elegir

- **No sabes cuál:** `seedance_2_5`. Es el general que recomienda el servidor.
- **Tiene que verse como cine real:** `veo3_1`, con su límite de 8 s y dos proporciones.
- **Lista de tomas con duración cada una:** `kling_o3_flf` con `multi_prompt`.
- **Va de una imagen a otra con nitidez:** `minimax_h3` (2K) o `kling3_0`.
- **Más de 15 s en un solo clip:** `seedance_2_5`, `kling4_0`, `cinematic_studio_video_4_0` o `wan3_0`.
- **Muchos clips de prueba:** `veo3_1_lite` o `kling3_0_turbo` en tanda, o el borrador de `seedance_2_5`.

## Recetas

### Clip vertical con sonido

```json
{ "params": {
  "model": "seedance_2_5",
  "prompt": "<english prompt>",
  "aspect_ratio": "9:16",
  "duration": 8,
  "resolution": "1080p"
} }
```

### Borrador y final

```json
{ "params": { "model": "seedance_2_5", "prompt": "<english prompt>", "aspect_ratio": "9:16", "duration": 15, "draft": true } }
```

```json
{ "params": { "model": "seedance_2_5", "draft_job_id": "<job_id del borrador>" } }
```

### Varias tomas con duración

```json
{ "params": {
  "model": "kling_o3_flf",
  "aspect_ratio": "16:9",
  "duration": 9,
  "multi_shots": true,
  "multi_prompt": [
    { "prompt": "Wide shot: …", "duration": 3 },
    { "prompt": "Close-up: …", "duration": 3 },
    { "prompt": "Low angle: …", "duration": 3 }
  ]
} }
```

### De un fotograma a otro

```json
{ "params": {
  "model": "kling3_0",
  "prompt": "<what happens between the two frames>",
  "aspect_ratio": "9:16",
  "duration": 5,
  "medias": [
    { "value": "<id inicial>", "role": "start_image" },
    { "value": "<id final>", "role": "end_image" }
  ]
} }
```

### Alargar un clip

```json
{ "params": {
  "model": "seedance_2_5",
  "mode": "video_extension",
  "extension_mode": "forward",
  "prompt": "<what happens next>",
  "medias": [ { "value": "<job_id del clip>", "role": "video_references" } ]
} }
```

## Lo que no se pudo comprobar

- El servidor recomienda `kling3_0` para varias tomas, pero en el catálogo los parámetros `multi_shots` y `multi_prompt` están en `kling_o3_flf`, `kling_o3_image_reference` y `cinematic_studio_video_3_5`, no en `kling3_0`. Con `kling3_0` las tomas se describen en el prompt.
- Si el `duration` general debe igualar la suma de las duraciones de `multi_prompt`: no verificado. Hazlos coincidir.
- Qué `mode` necesita `seedance_2_5` cuando solo lleva `start_image`: el catálogo dice `omni_reference` "para referencias de imagen, video o audio" y no menciona los fotogramas. Deja el valor por defecto y acepta lo que venga en `adjustments`.
- Si la llamada de finalización del borrador exige repetir `prompt` o `aspect_ratio`: no verificado. Si la rechaza, repite los del borrador.
