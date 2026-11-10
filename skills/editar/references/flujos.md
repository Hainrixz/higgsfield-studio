# Flujos de edición del servidor

Última revisión: noviembre 2026. Cada flujo se carga en vivo y **su texto manda** sobre este resumen. Si algo aquí no coincide con lo que devuelve el servidor, sigue al servidor.

Cómo se cargan:

| Flujo | Llamada |
|---|---|
| Montaje y subtítulos | `get_workflow_instructions` con `{workflow: "video-montage"}` |
| Motion graphics y edición por capas | `get_workflow_instructions` con `{workflow: "video-editing"}` |
| Corrección de color | `get_preset_instructions` con `{preset: "/color-grade"}` |
| Cambio de luz | `get_preset_instructions` con el comando del look, por ejemplo `{preset: "/neon-hf"}`, y luego `get_workflow_instructions` con `{workflow: "lighting-hf"}` |

Los archivos de apoyo que nombre cada flujo se leen con `get_workflow_bundle_file` (o con `get_preset_instructions` si la referencia empieza por `/`).

## `video-montage`: unir, musicalizar, subtitular

Para un video terminado a partir de clips que ya existen. No sirve para generar ni para entregar solo un archivo de subtítulos.

- Todo corre en `sandbox_exec`. Conserva intacto el máster original.
- Mide cada clip con `ffprobe`. Respeta orden, resolución, proporción y tiempos pedidos.
- **Cortes secos por defecto.** No añadas transiciones ni música que no pidieron.
- Si los clips coinciden en códec, tamaño, fps y audio: unión por lista (`concat`) sin recodificar. Si difieren, normaliza solo lo necesario.
- Música pedida: conserva la voz, baja la música bajo el habla y recórtala al largo real del montaje.
- Subtítulos: van **después** del montaje limpio. Se transcribe el audio real, se verifica el texto, se queman y se revisa el resultado codificado. Una transcripción no prueba que el quemado quedó bien.
- Verifica duración, pistas, primer y último fotograma y cada unión antes de decir que está listo.
- Entrega **un** video confirmado y di qué etapa no pudiste verificar.

Referencias del flujo: `references/subtitles.md`, `references/caption-clearance.md`, `references/ugc-captions.md`, `references/website-captions.md`, `references/faceless-captions.md`.

## `video-editing`: Higgsedit

Para cortes, recortes, cambio de banda sonora, diseños con marcos, texto animado, shaders, superposiciones y títulos. No se activa para analizar o resumir un video, ni para quemar subtítulos de voz corrientes (eso es `video-montage`).

- Higgsedit es una herramienta de línea de comandos dentro del sandbox. La autoridad sobre comandos y campos es `higgsedit --help`; si falta una opción, informa el desajuste, no instales ni sustituyas nada.
- Un proyecto tiene `project.json`, `media/` y `renders/`. Se escribe un guion JSX y se construye con `higgsedit build`.
- Puede entregar PNG, hojas de contacto y video (MP4/MOV/MKV; H.264, HEVC, AV1).
- Reserva la salida con `media_upload` **antes** de renderizar; descarga, proyecto, render, verificación y PUT van en la misma llamada a `sandbox_exec`.
- No hay herramienta que publique un proyecto editable ni un enlace a un editor en línea: se entrega la URL del archivo confirmado.
- No admite escenas HTML, LUT nativos ni callbacks de animación en tiempo de ejecución.

## `/color-grade`: color sin regenerar

Iguala el color de una foto o un clip a imágenes de referencia o a uno de 20 looks de cine incluidos, con vistas previas y exportación opcional de LUT. **No hace falta ninguna generación de pago**: es un motor en Python dentro del sandbox que cambia color, tono y textura sin reemplazar contenido.

1. Identifica el objetivo y la referencia (imágenes o nombre de look). No corrijas la referencia en vez del objetivo.
2. Lista los looks con `python3 "$HF_WORKFLOWS/color-grade/scripts/grade.py" --list`. Para un look incluido usa `--look SLUG`; para otro, pide un fotograma representativo. No inventes looks.
3. Haz una vista previa y mírala con `image_paths`. Juzga exposición, contraste, sombras/medios/luces, separación de tonos, piel y textura.
4. Ajusta uno o dos controles por pasada, **máximo tres pasadas**.
5. Renderiza, verifica el archivo final y entrega el material corregido con un antes/después y una explicación corta.

En video: mide primero; revisa al menos dos momentos distintos; `--mode full` incluye protección de piel, máscaras de cielo y brillo, `--mode fast` es para borradores o clips largos. Para renders largos usa `background: true`.

Límites que hay que decir: no mueve luces ni convierte un día en una noche iluminada de verdad; espera imagen SDR; no promete salida idéntica píxel a píxel ni cero parpadeo. El LUT `.cube` se exporta solo si lo piden, en un ZIP.

Antes de renderizar carga `/color-grade/references/render`; antes de afinar parámetros, `/color-grade/references/ops`.

## `lighting-hf`: cambiar la luz de un video

Reilumina un video con uno de 62 looks usando la edición de video de Seedance 2.5. Solo cambia la luz: quedan igual las personas, el encuadre, el movimiento, la sincronía de labios y el audio original. **Una generación de pago por clip.**

- Cada look es un comando: `/high-key-hf`, `/low-key-hf`, `/rembrandt-hf`, `/golden-hour-hf`, `/blue-hour-hf`, `/moonlight-hf`, `/neon-hf`, `/teal-orange-hf`, `/god-rays-hf`, `/silhouette-hf`, `/firelight-hf`, `/ring-light-hf`… La tabla completa viene en el flujo.
- **El prompt del look se manda tal cual.** No lo escribas ni lo reescribas. Una nota de la persona ("un poco más cálido") se añade como una sola frase al final de la sección NEW LIGHT, hablando solo de luz.
- Entrada: un video de **4 a 30 segundos**. Fuera de rango: informa la duración medida y para; recorta solo si lo piden.
- Resolución `720p` salvo que pidan `1080p` (o `480p` para una prueba rápida).
- Si el clip tiene texto en pantalla (subtítulos, logos), añade la frase que da el flujo para conservarlo; si no sabes, extrae un fotograma y míralo.
- Pasos: medir en el sandbox → decir el costo en una línea → `generate_video` con `model: "seedance_2_5"`, `mode: "video_edit"`, el clip como único medio con `role: "video"`, `generate_audio: false` → `jobs_wait` → devolver el audio original con ffmpeg en el sandbox → `media_confirm` → entregar.
- El resultado sale a 24 fps y puede terminar una fracción de segundo antes que el original. Dilo si pasa.
- Un trabajo fallido se reintenta una vez con la misma petición; uno pendiente nunca se reenvía.

## Nota común a todos

Las generaciones ilimitadas (`use_unlim`) solo aplican a `generate_image`, `generate_video` y `generate_audio`. El montaje, los upscales y la transcripción se cobran como siempre.
