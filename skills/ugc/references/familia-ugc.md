# Los seis formatos de `ugc-video` y cómo elegir

Higgsfield tuvo una familia de workflows de UGC, uno por tipo de video. Hoy (noviembre 2026) es **un solo workflow, `ugc-video`**, con una tubería compartida y seis perfiles de formato. Elegir mal el perfil no da error: da un video que no era el que pediste y que ya se cobró.

Esto se leyó del catálogo que devuelve `get_workflow_instructions` sin argumento y del propio workflow. **Vuelve a pedir el catálogo si algo no cuadra**: si un flujo cambió de nombre o apareció uno nuevo, el catálogo lo sabe y este archivo no.

## La tabla de ruteo

| Lo que te piden | Formato | Cómo se reconoce |
|---|---|---|
| Alguien hablándole a la cámara sobre el producto, o contando una historia sin producto. **Es el UGC por defecto** | review | "un video de alguien recomendando", "una creadora hablando de esto", "un review estilo TikTok" |
| Solo el producto en pantalla, con voz en off. Nadie habla a cámara | product | "solo el producto", "sin nadie hablando", "que el producto sea el protagonista" |
| Abrir la caja, con la reacción como clímax | unboxing | "unboxing", "abriendo el paquete", "haul", "primera reacción" |
| Se lo pone y se mueve: caída, talla, textura | try-on | "probándose", "OOTD", "fit check", "cómo queda puesto" |
| Paso a paso de cómo se usa, con rótulos "Step N" en pantalla | tutorial | "tutorial", "cómo se usa", "paso a paso" |
| Un sitio, una app o una tienda, con capturas reales en pantalla mientras alguien habla | website | "UGC de mi SaaS", "un video de mi tienda", "que se vea la página" |

Cada perfil vive en `references/formats/<formato>.md` dentro del workflow y se lee con `get_workflow_bundle_file`. Se carga uno solo.

## Las reglas de desempate

1. **La duda va a review.** El workflow lo dice: review es el formato por defecto de un UGC sin más detalle.
2. **Una URL no manda por sí sola.** Si la URL es solo *de dónde sale* el producto y la página nunca se ve en pantalla, identifica al producto y nada más. Si lo que tiene que verse es la página misma, es website.
3. **Nombrar el formato lo selecciona.** Si la persona dice "quiero un unboxing", es ese y no se discute.
4. **Un video largo es una sola pieza unida**, no una serie.
5. **Un comercial mudo de producto no es el formato product.** Ese formato lleva voz en off; lo mudo es generación de video normal (skill `video`).

## En qué se diferencian por dentro

| | review, unboxing, try-on, tutorial | product | website |
|---|---|---|---|
| Creador en cámara | Sí | No: se salta la generación de creador | Sí, como presentador |
| Tableros | Sí, con limpieza obligatoria | Los que indique su perfil | No hay tableros: capturas reales |
| Texto en pantalla | Prohibido, salvo los "Step N" del tutorial | Prohibido | Según su perfil de subtítulos |

Los valores concretos de cada llamada (modelo, proporción, resolución, orden de las referencias) los da el perfil. Los que cita el `SKILL.md` de esta skill salen del perfil review: para otro formato, lee su perfil y no los des por buenos.

## Lo que comparte todo formato

- Imágenes y clips salen por `generate_image_batch` y `generate_video_batch`: cada petición es `{ index, params }` con `count: 1`, hasta doce por llamada (el perfil review manda los clips en grupos de seis). Los índices se mantienen entre reintentos.
- Se espera con `jobs_wait`, grupos de doce, `timeout_seconds: 15`. Una entrada `submission_failed` sin `job_id` no se pasa a `jobs_wait`.
- Los clips usan `seedance_2_5` con `mode: "omni_reference"` y `generate_audio: true`. El habla es nativa del clip.
- `ffmpeg`, descargas, transcripción, montaje y subidas van en `sandbox_exec`. Un archivo creado en el sandbox se sube reservando antes con `media_upload`, haciendo el PUT en ese mismo comando y confirmando después.
- Un `unlim_choice` significa que no se lanzó nada: se le hace la pregunta a la persona y se reenvía igual con su respuesta.
- Un timeout no es un fallo: primero se consultan los ids que ya existen. Un fallo técnico explícito se reintenta una vez.

## Lo que NO es un UGC y a dónde va

| Pedido | A dónde va |
|---|---|
| Multiplicar un anuncio que ya existe en varias versiones | Workflow `ad-multiplier`, skill `anuncios` |
| Fotos de producto, packshot, catálogo | Workflow `product-photoshoot`, skill `producto` |
| Personaje consistente en varias vistas | Workflow `character-sheet`, skill `personajes` |
| Video narrado sin nadie en cámara | Workflow `faceless-video`, o el comando `/content-factory` desde `presets` |
| Reel con un presentador fijo, motion graphics y música | Comando `/shorts`, skill `presets` |
| Portada o miniatura de YouTube o Instagram | Workflow `thumbnail-generation`, skill `imagen` |
| Unir clips, cambiar música, quemar subtítulos | Workflow `video-montage`, skill `editar` |
| Logo, identidad, packaging, mockups | Workflow `brand-asset-creation` |
| Un guion solo, sin video | Se escribe en el chat; no se carga ningún workflow |

## Después de elegir

`get_workflow_instructions` con `{ workflow: "ugc-video" }` devuelve el documento con la tubería compartida y la lista de archivos. El perfil del formato y sus referencias de prompt se sacan con `get_workflow_bundle_file`. No los escribas de memoria.
