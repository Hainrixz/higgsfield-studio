# Anuncios en video: tres rutas

Leído del MCP en vivo (noviembre 2026). Cada ruta tiene su documento en el servidor; esto es el mapa para no perderse, no un sustituto.

## 1. `marketing_studio_video`

Anuncio corto de producto con `generate_video`. Mira su ficha con `models_explore` `action: "get"` antes de usarlo.

| Dato | Valor |
|---|---|
| Duración | 12 a 15 s |
| Proporciones | `auto`, `21:9`, `16:9`, `4:3`, `1:1`, `3:4`, `9:16`. **Por defecto sale horizontal**: pasa `9:16` para Reels y TikTok |
| `resolution` | `480p`, `720p` (defecto), `1080p` |
| `generate_audio` | `true` por defecto |
| Roles de `medias` | `image`, `start_image`, `end_image` |
| `mode` | El formato creativo de Marketing Studio. Es opcional |

Lo que funciona seguro en este conector: la foto del producto subida, un prompt en inglés que describa el anuncio, proporción y duración explícitas. `get_cost: true` da el precio.

**Límite de este conector.** El modelo acepta además `product_ids`, `avatar_ids`, `hook_id`, `setting_id`, `ad_reference_id` y un `mode` de catálogo, pero la ficha del modelo remite a herramientas de catálogo de Marketing Studio que no están entre las disponibles aquí, así que no hay forma de listar esos ids desde el chat. Sin el id, no lo inventes. Los avatares sí se pueden listar con `ads_studio_list_avatars`. Para elegir formato, gancho o escenario con interfaz, abre `show_marketing_studio_v2` (pestañas `ugc`, `ads`, `motion`…): el widget pide las entradas, genera y muestra. `hook_id` y `setting_id` no se combinan con `ad_reference_id`.

## 2. Micro-drama (`/drama-ads`)

Una película corta con personajes que actúan y hablan, donde la historia gira en torno al producto. Vertical `9:16` salvo que pidan otra forma. La dirige Claude en el chat y la une en el sandbox.

### Entrada

| Llega | Qué haces |
|---|---|
| `/drama-ads` sin nada más | `ads_studio_story_presets` y una línea: elige tarjeta o cuenta la historia. Para |
| `/drama-ads` con historia | `get_workflow_instructions` con `{ workflow: "drama-ads" }` y síguelo |
| Nombran una tarjeta del catálogo | Lo mismo; el workflow la lee con `ads_studio_story_recipe` |
| El mensaje del botón "Recreate Ad" | Es una petición de hacer esa película: carga el workflow |

El mensaje del botón trae `card <id>`, `mode: ask` o `mode: hands-off`, y opcionalmente `product <id>`, `characters avatar:<id>,…` e `idea: …`. Se actúa sobre los ids; lo que va entre «» son etiquetas.

El catálogo trae estilos (acción real, cartoon 3D, cinemático, plastilina, objeto que habla, dentro del cuerpo, muñecos, crochet) y tarjetas con su duración, de unos 40 s a 4 minutos. Se navega en vivo; no lo copies a un archivo.

### Orden que impone el workflow

1. `ads_studio_story_recipe` con `preset_id` (y `product_id` si eligieron producto). Su `story_id` va en cada `ads_studio_story_stage` y en el `show_result` final.
2. **Una pregunta de entrada**, solo por lo que falte: resolución (cada opción con el total de la película en créditos) y modo (parar en cada etapa o de un tirón).
3. **El plan antes del dinero:** reparto, lugares, objetos, número de clips y total estimado. `balance` una vez antes.
4. Referencias (hojas de personaje, lugares, objetos), clips ronda 1, clips ronda 2, montaje, revisión, entrega.

### Las paradas son del servidor

En modo `ask`, cada etapa pagada espera un sí y la pregunta cierra el turno. En `hands-off` no hay paradas tras la pregunta de entrada. No añadas ni quites paradas: el modo lo eligió la persona.

### Reglas que rompen la película si se saltan

- Todo descarga, revisión, unión y subida corre en `sandbox_exec`, en `/home/user/films/<nombre>`. Nunca en `/tmp`.
- Las generaciones de una etapa salen por `generate_image_batch` y `generate_video_batch`. La primera llamada de cada modelo y modo va sola, se espera y se comprueba.
- Tras cada envío, la última llamada del turno es `ads_studio_story_stage` con `story_id`, `stage` y todos los `jobs` (`{ index, job_id }`, hasta 24). Nunca `show_generations`, `job_display` ni `show_generation_by_ids` para una etapa: la galería única va al final.
- Ads Studio se lee solo con `ads_studio_story_recipe` y `ads_studio_list_avatars`. Las demás herramientas `ads_studio_*` abren tarjetas con botones de otros flujos.
- Un avatar se usa importando su `preview_url` con `media_import_url` y pasando el `media_id` como foto de cara.
- Ninguna herramienta cotiza la película entera: el total se suma con las tarifas de `references/models.md` del workflow (léelo con `get_workflow_bundle_file`). Cada pregunta lleva "gastado X de ≈ Y".
- Como mucho 16 trabajos a la vez en la cuenta. Un 429 no creó trabajo ni costó: reenvía solo esos.
- Un trabajo no se regenera porque se perdió su archivo: se vuelve a descargar de su URL.

## 3. Ad Multiplier

Un video de entrada, de **4.0 a 30.0 s**. `N` cuenta videos finales. Si la duración queda fuera, se para: no se recorta ni se alarga.

| Modo | Qué hace | Modelo |
|---|---|---|
| Editar (por defecto) | Reemplaza, añade, quita o modifica personas, producto, ropa, fondo o un texto señalado. Conserva movimiento, cortes, tiempos y audio original | `ad_multiplier` |
| Recrear | Vuelve a filmar el mismo anuncio como material nuevo para otro mercado, idioma, público, elenco o producto | `ad_multiplier_v2` |
| Solo gancho o cierre | Cambia la apertura, el cierre o ambos y deja el resto | `ad_multiplier_v2` con `mode: "sections"` y `section: "hook"`, `"cta"` o `"both"` |

Si la petición encaja en editar y en recrear, una pregunta: ¿conservar el metraje original cambiando lo señalado, o volver a filmarlo?

### Editar

1. Intake en un solo turno: qué cambia y cuántas salidas, si hay imágenes de referencia, resolución (`720p` recomendada o `1080p`).
2. Subir el video una vez. `ffprobe` en `sandbox_exec` para medir.
3. `video_analysis_create` con `video_input_id` y `video_analysis_status` cada 30 a 60 s.
4. Si falta la foto de una persona de reemplazo, el workflow genera un adulto con `soul_2` y **pide aprobación de ese candidato** antes de seguir (regla del workflow).
5. Cargar `references/prompt-writer.md` del workflow y escribir un prompt por salida.
6. Enviar cada salida con `generate_video`, una a la vez, `count: 1`, `mode: "video_edit"`, `generate_audio: false`. Primero el video (`role: "video"`), luego las imágenes (`role: "image"`) en el orden del prompt.
7. Finalizar en `sandbox_exec`: restaurar el audio original, verificar y subir. El entregable es el archivo confirmado, no la vista previa muda del widget.

### Recrear y solo gancho o cierre

Carga `references/recreate.md` con `get_workflow_bundle_file`. Ahí el servidor hace el trabajo creativo: no se corre análisis, no se escribe prompt de video ni se finaliza en sandbox. Se manda solo `prompt` (la petición con palabras de la persona, hasta 4000 caracteres), `medias` (el video y hasta 20 imágenes), `resolution` y `count: 1`. No se manda `duration`, `aspect_ratio`, `generate_audio` ni `use_unlim`: este modelo se paga solo con créditos. Por defecto, 1 salida a `720p`. Un `403 minimum_pro_plan_required` significa que hace falta plan Pro o superior: se dice y se para.

### Reglas comunes

- Un envío a la vez. Sin batch, sin `jobs_wait` en grupo, sin galería: cada `generate_video` trae su widget que se actualiza solo. Si sigue pendiente, se dice y no se reenvía.
- Listas ordenadas se emparejan por posición. Nunca un producto cartesiano de listas.
- Cada posición fallida se reintenta una vez.
- No sirve para doblar o traducir el metraje existente (eso es `audio`), ni para un anuncio original que solo toma ideas de otro.
