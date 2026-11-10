# Voces, modelos de audio y recetas

Leído de los esquemas y del catálogo en vivo (noviembre 2026). Si algo no cuadra, `models_explore` con `action: "list"` y `type: "audio"`.

## Modelos

| Modelo | Para qué | Parámetros propios |
|---|---|---|
| `seed_audio` | Voz. El que recomienda el servidor por defecto | `voice_type` + `voice_id` (opcionales, pero juntos), `format` (`wav`, `mp3`, `pcm`, `ogg_opus`), `sample_rate` (8000 a 48000; por defecto 24000), `speech_rate` (−50 a 100), `loudness_rate` (−50 a 100), `pitch_rate` (−12 a 12). Acepta `medias` con rol `audio_references` (clona al vuelo de ese audio) o `image_references` |
| `text2speech_v2` | Voz con motor elegido | `variant` (`elevenlabs`, `minimax`, `seed_speech`, `vibe_voice`, `cozy_voice`), `voice_type`, `voice_id`: los tres obligatorios |
| `elevenlabs_v4` | Diálogo, hasta 10 voces | `dialogue` (obligatorio): lista ordenada de `{ "text", "voice_type", "voice_id" }`, 10 000 caracteres en total. `stability`, `similarity_boost` (0 a 1) |
| `elevenlabs_v4_turbo` | Lo mismo con una sola voz, más rápido | Igual; todos los turnos con la misma voz |
| `qwen_audio_tts` | Voz con indicación de emoción o acento | `voice_type`, `voice_id` (obligatorios), `instruction` (hasta 128 caracteres), `language`. Su lista de idiomas **no** incluye español |
| `elevenlabs_music_v2_5`, `elevenlabs_music_v2` | Música | `duration` (obligatoria, 3 a 600), `lyrics` (hasta 120 s), `force_instrumental`, `batch_size` (1 a 4) |
| `mirelo_text_to_audio` | Efectos de sonido | `duration` (obligatoria) |
| `sonilo_music`, `inworld_text_to_speech` | Solo para el generador de juegos | No usar en audio suelto |

## Voces

`list_voices` acepta `size` (hasta 100, por defecto 20) y `cursor` para la página siguiente. Devuelve por voz: `voice_id`, `voice_type`, `name`, `gender` y `preview_url`. Las propias de la persona vienen primero, como `element`.

- No hay filtro por idioma ni por género: se filtra leyendo la lista. Si buscan algo concreto, pide `size: 100` y pagina.
- No inventes un `voice_id` ni lo copies de otra conversación: sale siempre de `list_voices`.
- Para elegir, da tres o cuatro nombres con su enlace de muestra. Si ya dijeron cuál, úsala.

## Recetas

### Locución

```json
{ "params": {
  "model": "seed_audio",
  "prompt": "Hola, soy Ana. Hoy te enseño tres formas de preparar café en casa.",
  "voice_type": "preset",
  "voice_id": "<voice_id de list_voices>",
  "format": "mp3"
} }
```

### Con motor concreto

```json
{ "params": {
  "model": "text2speech_v2",
  "variant": "elevenlabs",
  "prompt": "<texto a decir>",
  "voice_type": "element",
  "voice_id": "<voice_id>"
} }
```

### Diálogo

```json
{ "params": {
  "model": "elevenlabs_v4",
  "prompt": "Diálogo café",
  "dialogue": [
    { "text": "¿Ya probaste el nuevo?", "voice_type": "preset", "voice_id": "<voz A>" },
    { "text": "Todavía no. ¿Vale la pena?", "voice_type": "preset", "voice_id": "<voz B>" }
  ]
} }
```

`generate_audio` exige `prompt` siempre; con `dialogue`, lo que se dice sale de los turnos.

### Varias frases con la misma voz

```json
{ "requests": [
  { "index": 1, "params": { "model": "seed_audio", "prompt": "<frase 1>", "voice_type": "preset", "voice_id": "<id>" } },
  { "index": 2, "params": { "model": "seed_audio", "prompt": "<frase 2>", "voice_type": "preset", "voice_id": "<id>" } }
] }
```

Hasta 12 por llamada. Espera con `jobs_wait` y enséñalas con un solo `show_generation_by_ids`.

### Música

```json
{ "params": {
  "model": "elevenlabs_music_v2_5",
  "prompt": "Warm lo-fi hip hop, 80 bpm, soft Rhodes piano, vinyl crackle, relaxed and optimistic",
  "duration": 30,
  "force_instrumental": true
} }
```

### Efecto

```json
{ "params": { "model": "mirelo_text_to_audio", "prompt": "Glass bottle opening with a sharp fizz", "duration": 2 } }
```

### Sincronizar labios

Con `generate_video`:

```json
{ "params": {
  "model": "sync_so",
  "medias": [
    { "value": "<id del video>", "role": "input_video" },
    { "value": "<id del audio>", "role": "input_audio" }
  ],
  "sync_mode": "cut_off"
} }
```

`sync_mode` decide qué pasa si video y audio no duran lo mismo: `bounce` (el video va y vuelve, por defecto), `loop` (se repite), `cut_off` (corta al más corto), `silence` (rellena el audio con silencio) o `remap` (cambia la velocidad del video).

## Doblaje: códigos de idioma

`target_language` acepta exactamente estos:

| Código | Idioma | Código | Idioma | Código | Idioma |
|---|---|---|---|---|---|
| `spa` | Español | `eng` | Inglés | `por` | Portugués |
| `fra` | Francés | `ita` | Italiano | `deu` | Alemán |
| `cmn` | Chino | `jpn` | Japonés | `kor` | Coreano |
| `hin` | Hindi | `ara` | Árabe | `rus` | Ruso |
| `tur` | Turco | `pol` | Polaco | `ind` | Indonesio |
| `fil` | Filipino | `swe` | Sueco | `fin` | Finés |

El tamaño de salida es el del video original. Un idioma por llamada: para tres idiomas, tres llamadas.

## Clonar: el camino directo, paso a paso

1. `media_upload` con el nombre del archivo de audio.
2. PUT de los bytes a la `upload_url`.
3. `media_confirm` con `type: "audio"`.
4. `create_voice_from_confirmed_audio` con `audio_media_id` y `name` (y `description` si quieres).
5. Si responde `processing`, o `is_audio_eligible` no es verdadero, sigue entrenando: vuelve a `list_voices` hasta que aparezca lista. `voice_clone_failed` o `failed` es que no salió: pide un audio más limpio.

Si la respuesta trae `recovery_tool` (por ejemplo, por falta de créditos), llámala de inmediato.

## Lo que no se pudo comprobar

- `suno_music` y `suno_mashup`: la descripción de `generate_audio` los menciona; el catálogo de hoy no los lista.
- `mirelo_text_to_audio`: la descripción de `generate_audio` lo indica para efectos; el catálogo lo etiqueta "solo generador de juegos". Si el servidor lo rechaza, dilo: no hay otro modelo de efectos en el catálogo.
- Qué hace `prompt` cuando hay `dialogue` en `elevenlabs_v4`: no verificado. Pon una etiqueta corta.
- Que `sync_so` se lance con `generate_video`: se deduce de que está en el catálogo de video; no se ejecutó.
- El límite de 2048 caracteres por texto de voz viene del flujo `narration` del servidor, no del esquema.
- Si `dubbing` y `voice_change` cobran por duración: sus esquemas no aceptan `get_cost`, así que el precio no se puede consultar antes.
