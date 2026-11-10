# Flujos de video del servidor

Higgsfield trae flujos empaquetados: instrucciones largas que orquestan las herramientas de generación y un sandbox remoto. No se improvisan ni se resumen de memoria: se cargan y se siguen.

## Cómo se cargan

1. `get_workflow_instructions` sin argumento: lista los flujos y sus disparadores.
2. `get_workflow_instructions` con `workflow: "<nombre>"`: devuelve el texto completo y la lista de archivos del flujo.
3. `get_workflow_bundle_file` con `workflow` y `path`: lee una referencia cuando el flujo lo pida.

Los flujos corren sus scripts en `sandbox_exec`. El sandbox es efímero: cada fase va en un solo comando y el archivo final se entrega subiéndolo (`media_upload`, PUT dentro del sandbox, `media_confirm`), no como ruta.

Cada flujo trae sus propias preguntas y, a veces, sus propias aprobaciones. Esas sí se respetan: son del servidor. Lo que no haces es añadir preguntas tuyas encima.

## `faceless-video` (versión 2.4, noviembre 2026)

Un video terminado, narrado y sin presentador a cámara.

- **Tipos:** Explainer, History, Kids, Picture Story, Fairy Tale & Myth.
- **Formatos:** montaje de clips animados en bloques de 10 s, o imágenes fijas narradas (una imagen por frase). Kids tiene además modo canción.
- **Arranque:** una sola ronda de preguntas, en orden fijo y solo de lo que falte: tipo, animado o fijo, estilo, duración, proporción, subtítulos, miniatura, tema y voz. Lo que la persona ya dijo no se vuelve a preguntar. Después corre hasta entregar.
- **Por dentro:** los bloques animados salen de `minimax_h3` en 2K por `generate_video_batch`; la voz la hace el flujo `narration`; los subtítulos, el flujo `video-montage`.
- **No es para:** ideas o guiones sueltos, un solo clip, animar una foto, editar metraje, anuncios, nada con una persona a cámara, miniaturas.

## `narration` (versión 1.1)

Voz que encaja, no voz a secas. Solo tres encargos:

1. Tomas numeradas ajustadas a ventanas fijas de video.
2. Una lectura larga y continua con la misma voz.
3. "Ponme en este video": un video que ya existe más la foto de una persona que consiente, convertida en narrador en pantalla.

- Necesita el par de voz `voice_id` + `voice_type`. Si falta, el flujo abre `list_voices` para elegir.
- Tomas por bloque: `text2speech_v2` con `variant: "elevenlabs"`. Lectura continua: `seed_audio`.
- El largo se corrige **reescribiendo el texto**, nunca estirando el audio.
- Límite del prompt de voz: 2048 caracteres; lo más largo se parte en trozos grandes.
- **No es para:** clonar voces, leer un texto sin más, música, efectos, doblaje. Eso es `audio`.

## `reel-effects` (versión 4.2)

Efectos de edición ya construidos sobre el clip vertical de una persona hablando. Se entra por el comando del efecto: `get_preset_instructions` con `preset: "/text-behind"` (o el que sea) devuelve qué hacer y manda a este flujo.

| Comando | Qué hace |
|---|---|
| `/text-behind` | Palabras clave detrás de la cabeza al decirlas |
| `/captions` | Subtítulos animados de todo el clip |
| `/tier-list` | Panel de ranking que se llena al nombrar cada cosa |
| `/freeze-frame` | Congelado con nombre y rol |
| `/glass-graph` | Tarjeta con gráfica de un número a otro |
| `/over-the-shoulder` | Tarjeta de antes y después |
| `/grade-wipe` | Barrido de corrección de color |
| `/katana-bold`, `/katana-cool-girl`, `/katana-cool-dude` | Looks completos de tipografía y color (uno por video) |
| `/katana-orbit`, `/katana-reel-cards`, `/katana-ig-follow`, `/katana-app-window`, `/katana-file-scroll` | Insertos animados |

- **Entrada:** un video de alguien hablando. Se recorta a 1080×1920 a 30 fps y se usan los primeros 60 segundos. Sin video, se pide en una línea.
- **Costo:** el único paso de pago es el recorte de la persona con `remove_background`, y solo en los efectos que lo necesitan. Lo demás se rinde en el sandbox sin créditos. Se dice en una línea y se sigue.
- Lo que aparece en pantalla sale de lo que la persona dice (el flujo transcribe). No se inventan cifras, nombres ni cuentas.
- Varios comandos en un mensaje van sobre el mismo video.

## Otros flujos que rozan el video

| Flujo | Skill que lo lleva |
|---|---|
| `ugc-video` | `ugc` |
| `ad-multiplier`, `ads-studio`, `drama-ads` | `anuncios` |
| `video-montage`, `video-editing`, `lighting-hf`, `color-grade` | `editar` |
| `katana` | `presets` |
| `thumbnail-generation` | `imagen` |
