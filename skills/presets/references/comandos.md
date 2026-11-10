# Comandos con barra: qué hace cada uno

Resumen de lo que devuelve `get_preset_instructions` (noviembre 2026). **La receta en vivo manda**: pídela cada vez, porque son documentos largos que el servidor actualiza. Esto sirve para saber qué esperar y no para ejecutar de memoria.

Regla común: resuelve el comando exacto antes de elegir herramientas o pedir archivos. Si el mensaje trae un bloque `MEDIA:` con líneas `<campo>: <image|video> media_id=<uuid>`, son archivos que la persona ya subió desde la web de Higgsfield: pásalos como `media` a `get_preset_instructions` y no los pidas otra vez. Un mensaje con `HANDOFF: handoff_id=<uuid>` se resuelve pasando ese id como `handoff_id`, sin `preset`.

## Recetas de imagen y video

Unas 80 recetas. Cada una devuelve parámetros de generación y un prompt maestro.

- Se ejecutan con `generate_image` o `generate_video`, con los parámetros dados y el prompt **sin cambios**.
- Sin plan, sin opciones de prompt, sin buscar modelo y sin confirmación extra. Lo dice la propia receta.
- Generan **una** salida salvo que pidan más. El formato que pida la persona gana: cuadrado es `1:1`, horizontal `16:9`, historia o reel `9:16`.
- Las de retrato con transformación (las de Halloween, con emoji o con nombre) parten de un retrato subido y devuelven un video corto.
- Las generaciones gratis (`use_free_gens`) no están disponibles en este conector para recetas: si las exigen, se explica y no se manda una versión pagada en su lugar.

## `/genjutsu`

Cuatro caminos, alternativos entre sí:

| Llega | Qué haces |
|---|---|
| `/genjutsu` a secas, o "quiero ver" | `get_presets` con `source: "genjutsu"`, `category: "genjutsu"`. Paras. El widget pide referencias, enseña precio y genera cuando la persona pulsa |
| "Lo más popular" | `category: "genjutsu-trending"` antes de elegir video o modelo |
| Un estilo con nombre sobre su video | Galería `genjutsu-styles` y `execute_preset` si piden generarlo (`galerias.md`) |
| "Copia este movimiento" o "cambia este objeto" con su propio video | Modelo directo con `generate_video` |

Modelos directos:

- Copiar movimiento, gestos, baile o movimiento de cámara de un video a los sujetos de unas imágenes: `hf_mult_motion_control`.
- Reemplazar un objeto, producto, prenda o personaje de un video con imágenes de referencia: `hf_mult_replace_object`.

En ambos, `medias` lleva las imágenes y **exactamente un** video. `genjutsu` no es un id de modelo. Mira la ficha con `models_explore` `action: "get"` para resolución y roles vigentes. Este camino es el oficio de la skill `animar`.

## `/katana`

Edita el metraje de la persona según su brief, o hace un remix: un video nuevo con el lenguaje visual de un video de referencia y los sujetos de la persona. Nunca reconstruye la referencia plano por plano.

| Llega | Qué haces |
|---|---|
| `/katana` sin archivos ni brief | `get_presets` con `source: "katana"` y paras |
| Archivos o un brief con sustancia | `get_workflow_instructions` con `{ workflow: "katana" }` y se sigue desde su primer paso |
| Video de referencia más imagen del sujeto, sin texto | Ya es una petición de producción: el video es la referencia y la imagen el protagonista |
| Archivos sin pedir resultado | Se inspeccionan y se describen. Nada pagado |
| "Un preset Katana tipo X" | `get_preset_instructions` sin `preset`, se elige por título y descripción, y se carga `/katana/<slug>` |

### La cadena de una corrida con preset

1. `get_preset_instructions` con `/katana/<slug>`: lee **todas** las partes y reúne las entradas.
2. `get_katana_config` con `preset` (el `/katana/<slug>` exacto), `free_generation` e `idempotency_key`. Crea la sesión de la corrida. `free_generation: false` para una corrida pagada; `true` solo si la persona pidió expresamente la gratuita, porque gasta su corrida gratis de Katana al empezar. En reintentos, la misma llave.
3. El `preset_session_id` que devuelve va en **cada** generación, cada consulta de costo y cada elemento de batch de la corrida.
4. Producción según el workflow `katana`, todo en `sandbox_exec`.
5. Subir el video final (`media_upload`, PUT, `media_confirm`).
6. `register_katana_result` con `preset_id`, el `media_id` del video final y el `preset_session_id`. Enlaza el video como trabajo terminado; no genera ni cobra. Ante timeout, se repite con las mismas entradas.
7. `show_result` con `action: "katana_video"`, el `media_id` (o `url`), el `preset` y el `preset_session_id`. `show_katana_result` es la versión antigua y se conserva por compatibilidad.

Un `/katana` general sin preset no crea sesión: `get_katana_config` es solo para un preset publicado concreto.

### Cómo gasta Katana

El workflow es autónomo por diseño: no pregunta, no pide confirmación de créditos y no ofrece menús. Antes del primer trabajo pagado termina el análisis gratuito, cotiza cada trabajo con `get_cost: true`, fija un tope finito para toda la corrida, **dice el gasto previsto** y sigue. Un tope que dé la persona se respeta. Si algo exige un permiso que no hay, termina con una explicación, no con una pregunta.

Eso incluye las generaciones ilimitadas: Katana no hace la pregunta de `unlim_choice`. Si la persona no pidió usar sus ilimitadas, el workflow manda `use_unlim: false` de forma explícita para pagar con créditos sin detenerse. `use_unlim: true` sigue siendo solo a petición.

## `/shorts`

Un reel vertical de alrededor de un minuto (hasta unos dos) con un presentador de IA constante: guion con gancho, tomas del presentador, subtítulos, motion graphics, efectos y música, compuesto y renderizado en el sandbox.

| Llega | Qué haces |
|---|---|
| `/shorts` a secas | `get_presets` con `source: "shorts_studio"` como única herramienta del turno. Paras |
| `/shorts` con tema, guion, preset o archivos | Es la petición de hacer el reel y pagarlo. Se corre de principio a fin |
| `/shorts/<slug>` | `get_preset_instructions` con ese comando; el preset publicado queda como referencia de estilo |

- **No pregunta nada.** Decide presentador, lugar, idioma y estilo, y lo dice en una línea. Solo se conserva una parada si la persona la pidió (por ejemplo, aprobar el guion).
- Antes de la primera llamada pagada, una línea con el costo estimado, y sigue en el mismo turno. Un tope que dé la persona se cumple ajustando el plan (menos tomas, más cortas, `720p`).
- Por defecto: `9:16`, tomas a `1080p`, `seedance_2_5`, la voz nativa del clip.
- Las referencias se cargan una a una con `get_preset_instructions` y la ruta `/shorts/references/<archivo>`.
- Entrega: subir el render final, `register_result` con `kind: "shorts"` y su `media_id` (más el `preset_id` si la corrida usó un `/shorts/<slug>`), y `show_result` con `action: "shorts_studio_video"` y `preset: "/shorts"`.

No es para videos narrados sin presentador ni para recortar o subtitular un video que ya existe.

## `/content-factory`

Hoy tiene un formato: el video "what if", vertical, de unos 60 s, donde cada fotograma se dibuja con código en el sandbox. **La única llamada pagada es la voz en off.** No se generan imágenes ni video para este formato.

| Llega | Qué haces |
|---|---|
| `/content-factory` a secas | `get_presets` con `source: "what_if"` como única herramienta del turno. Paras |
| Un estilo sin tema | Se pide el tema en una línea |
| Un tema | Se hace el video, sin más preguntas |

- El idioma es el de las palabras que escribió la persona.
- Varios episodios se hacen de uno en uno, en orden, cada uno entregado al pasar su revisión.
- Entrega: `register_what_if_result` con el `media_id` del video final, el `preset_id` del estilo si se usó uno y `episode` cuando hay varios. Una vez por video.
- Las referencias (`what-if-reference`, `what-if-voiceover`, `higgsedit`, `glsl-3d`) se cargan con la ruta `/content-factory/references/<archivo>` cuando toca su paso.

## Los tres `register_*`

| Herramienta | Para | Obligatorio | Opcional |
|---|---|---|---|
| `register_katana_result` | El video final de un preset Katana | `preset_id`, `media_id` | `preset_session_id` (pásalo siempre en una corrida con preset), `folder_id` |
| `register_result` | El reel final de `/shorts` | `kind: "shorts"`, `media_id` | `preset_id`, `folder_id` |
| `register_what_if_result` | Un video final de `/content-factory` | `media_id` | `preset_id`, `episode`, `folder_id` |

Los tres enlazan un video que ya existe como trabajo terminado en el espacio de trabajo. No copian archivos, no generan, no cobran y no publican. Solo el `media_id` del video final confirmado: nunca una URL, una ruta local, un `job_id`, un borrador o un video de referencia. Un video se registra una vez; ante timeout se repite igual, sin volver a renderizar ni a subir.

## Otros comandos

- `/drama-ads`: micro-drama publicitario. Lo lleva la skill `anuncios`.
- `/3d-jutsu`: escenas 3D alojadas con las herramientas `scene_builder_3d_*`. Hay que resolverlo antes de cualquier trabajo de escena o de nuevos ángulos de un lugar. Lo lleva `tres-d`.
- Comandos de montaje y efecto sobre un clip propio (gradación de color, iluminación, efectos de reel): se resuelven igual, con `get_preset_instructions`, y el resultado es un archivo editado. Los lleva `editar`.
