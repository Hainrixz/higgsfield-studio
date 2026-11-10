---
name: audio
description: Voz, música y sonido con Higgsfield. Convierte texto en voz con una voz del catálogo o con la tuya, hace diálogos a varias voces, genera música y efectos, lista las voces disponibles, clona una voz, dobla un video a otro idioma, le cambia la voz a un video y sincroniza labios con un audio nuevo. Úsala si dices "ponle voz a este texto", "léeme esto", "una locución", "voz en off", "un diálogo entre dos", "hazme una canción", "música de fondo", "un efecto de sonido", "qué voces hay", "clona mi voz", "dobla este video al inglés", "tradúcele la voz", "cámbiale la voz" o "sincroniza los labios". EN: text-to-speech, dialogue, music, SFX, voice list, voice cloning, dubbing, voice change and lipsync on Higgsfield.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Audio

Todo lo que se oye. `generate_audio` hace una pieza, `generate_audio_batch` varias, y hay herramientas propias para clonar voz, doblar y cambiar la voz de un video. Carga antes la skill `estudio`; aquí solo va lo propio de audio.

Una diferencia con el resto del plugin: en voz, el `prompt` **es el texto que se va a decir**. Va en el idioma en que debe sonar, no en inglés. En música y efectos el prompt sí va en inglés.

## Cuándo se activa

- Piden una locución, una voz en off o un diálogo.
- Piden música o un efecto de sonido.
- Preguntan qué voces hay o piden usar la suya.
- Piden clonar una voz.
- Piden doblar un video, cambiarle la voz o ajustar los labios a otro audio.

## Rutas

| Piden | Ruta |
|---|---|
| Texto a voz | `generate_audio` con `model: "seed_audio"` |
| Texto a voz con un motor concreto (ElevenLabs, MiniMax…) | `generate_audio` con `model: "text2speech_v2"` y `variant` |
| Diálogo a varias voces | `generate_audio` con `model: "elevenlabs_v4"` y `dialogue` |
| Varias frases sueltas (2 a 12) | `generate_audio_batch` |
| Música | `generate_audio` con un modelo de música y `duration` |
| Efecto de sonido | `generate_audio` con `model: "mirelo_text_to_audio"` y `duration` |
| Ver voces | `list_voices` |
| Clonar una voz | `create_voice`, o `create_voice_from_confirmed_audio` |
| Doblar un video | `dubbing` |
| Cambiar la voz de un video | `voice_change` |
| Labios de un video con otro audio | `generate_video` con `model: "sync_so"` |

Parámetros y ejemplos de cada una en `references/voces-y-modelos.md`.

## Procedimiento para voz

1. **Elige la voz.** Si no la nombraron, `list_voices`: devuelve las voces del catálogo (`voice_type: "preset"`) y las propias de la persona (`voice_type: "element"`), cada una con `voice_id` y un `preview_url` para oírla. Si dijo "con mi voz", es una de las suyas. Si no dijo ninguna, elige una que encaje con el texto y di cuál usaste; no hace falta preguntar.
2. **Pasa el par completo.** `voice_type` y `voice_id` van siempre juntos, tal como los devolvió `list_voices`.
3. **Modelo.** `seed_audio` salvo que pidan un motor por nombre; entonces `text2speech_v2` con `variant`: `elevenlabs`, `minimax`, `seed_speech`, `vibe_voice` o `cozy_voice`.
4. **Texto.** Escribe los números con letra, quita lo que no deba leerse (viñetas, emojis, enlaces). Si pasa de unos 2000 caracteres, pártelo por párrafos y mándalo en tanda con la misma voz.
5. **Lanza, espera y entrega** como dice `estudio`. Una sola locución corta se genera directo y el costo se informa al entregar.

Ajustes de `seed_audio`, solo si los piden: `speech_rate` (velocidad), `pitch_rate` (tono), `loudness_rate` (volumen) y `format` (`wav` por defecto, `mp3`, `ogg_opus`).

## Música y efectos

- **Música:** hoy el catálogo expone `elevenlabs_music_v2_5` (noviembre 2026). `duration` es obligatoria (3 a 600 s). Con `lyrics` propias, hasta 120 s. `force_instrumental: true` para que no cante. El prompt describe género, tempo, instrumentos y ánimo.
- El servidor también contempla `suno_music` y `suno_mashup` "cuando el catálogo los exponga". Hoy no aparecen: confírmalo con `models_explore` (`type: "audio"`) antes de usarlos.
- **Efectos:** `mirelo_text_to_audio` con `prompt` y `duration` en segundos. Es la ruta que indica el servidor, aunque el catálogo lo etiqueta como modelo de juegos: si lo rechaza, dilo tal cual.
- **No uses** `sonilo_music` ni `inworld_text_to_speech`: son solo del generador de juegos.

## Clonar una voz

Solo si lo pidieron, y solo la voz de quien lo pide o de alguien que dio permiso. Dos caminos:

- **Con visor:** `create_voice`. Abre un cuadro donde la persona graba o sube el audio, le pone nombre y la voz se crea ahí mismo. Si ya tiene el archivo, `initial_tab: "upload"`. Cuando el visor diga que terminó, **no** llames a nada más.
- **Directo (tienes el archivo en disco):** súbelo como audio (lo explica `estudio`) y llama a `create_voice_from_confirmed_audio` con `audio_media_id` y `name`. El audio debe ser voz clara, de unos 10 segundos a 3 minutos. Se cobra al crearse.

La clonación tarda. La respuesta suele decir `processing`: vuelve a mirar con `list_voices` y úsala solo cuando esté lista. Entonces se usa con `voice_type: "element"`.

## Doblar, cambiar la voz, sincronizar labios

| Herramienta | Qué hace | Parámetros |
|---|---|---|
| `dubbing` | Traduce lo que se dice, lo sintetiza y ajusta los labios | `video_id`, `target_language` |
| `voice_change` | Cambia la voz y conserva tiempos e imagen | `video_id`, `voice_id`, `voice_type` |
| `sync_so` por `generate_video` | Ajusta los labios de un video a un audio que tú le das | `medias` con roles `input_video` e `input_audio`; `sync_mode` |

`video_id` es un `media_id` de video confirmado o el `job_id` de un video generado. Los códigos de idioma de `dubbing` son de tres letras (`spa`, `eng`, `por`, `fra`…): lista completa en la referencia. Ninguna de las dos primeras usa `prompt` ni `count`, y ninguna acepta `get_cost`: di que el precio no se puede consultar antes y sigue.

## Errores comunes

- **Traducir al inglés el texto de una locución.** Se lee lo que mandas.
- **Mandar `voice_id` sin `voice_type`,** o con el tipo cambiado. Si "no resuelve", prueba una vez con el otro tipo.
- **Usar una voz recién clonada.** Espera a que esté lista.
- **Cambiar de voz entre trozos de un mismo texto.** Un texto, una voz.
- **Arreglar la duración estirando el audio.** Se reescribe el texto más corto o más largo.
- **Música sin `duration`.** Es obligatoria.
- **Usar `dubbing` para poner voz a un video mudo.** Dobla lo que ya se habla. Para un video sin voz: genera la locución y móntala con `editar`.
- **Usar el flujo `narration` para leer un texto.** Ese flujo es para voz ajustada a ventanas de video; lo lleva `video`.

## A dónde seguir

| Después quieren | Skill |
|---|---|
| Que una foto diga ese audio | `animar` |
| Un video narrado completo | `video` |
| Montar la voz o la música sobre un video, subtítulos | `editar` |
| Un creador hablando de un producto | `ugc` |
| La voz fija de un personaje de marca | `personajes` |
| Música en tendencia para TikTok | `publicar` |
