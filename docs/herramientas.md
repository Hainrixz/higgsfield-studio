# Mapa de herramientas de Higgsfield

Última revisión: noviembre 2026.

Las 150 herramientas que expone el MCP de Higgsfield, por área. Los nombres van **sin prefijo**: según cómo conectaste Higgsfield, cada una lleva delante `mcp__claude_ai_Higgsfield__` o `mcp__higgsfield__`. La lista de nombres válidos vive en `scripts/herramientas.txt`; si una herramienta no está ahí, no existe.

Cómo leer la columna **Créditos**:

- **sí**: lanzarla gasta créditos de la cuenta.
- **no**: leer, listar, mostrar u ordenar. No gasta.
- **depende**: gasta solo en alguna de sus acciones o según los parámetros, o el servidor no declara su costo. Antes de usarla, mira si acepta consulta previa de costo; si no, el gasto real aparece después en el historial de movimientos.

La columna **Skill** dice qué skill del plugin explica cómo usarla.

## Imagen

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `generate_image` | Genera una imagen (o de 2 a 4 variantes del mismo prompt), también GIF y SVG nativos | sí | `imagen` |
| `generate_image_batch` | Lanza de 1 a 12 imágenes distintas en paralelo, sin visor | sí | `imagen` |

## Video

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `generate_video` | Genera un video desde texto, imágenes o un video de entrada | sí | `video` |
| `generate_video_batch` | Lanza de 1 a 12 videos distintos en paralelo, sin visor | sí | `video` |

## Audio y voz

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `generate_audio` | Genera voz, música o efectos de sonido a partir de un texto | sí | `audio` |
| `generate_audio_batch` | Lanza de 1 a 12 audios distintos en paralelo, sin visor | sí | `audio` |
| `list_voices` | Lista las voces de fábrica y las propias, con muestra para escuchar | no | `audio` |
| `create_voice` | Abre el cuadro para grabar o subir audio y crear una voz clonada | sí | `audio` |
| `create_voice_from_confirmed_audio` | Crea una voz clonada desde un audio ya subido y confirmado | sí | `audio` |
| `voice_change` | Cambia la voz de quien habla en un video, conservando tiempos e imagen | sí | `audio` |
| `dubbing` | Dobla un video a otro idioma con sincronía de labios (18 idiomas) | sí | `audio` |

## 3D y escenas

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `generate_3d` | Convierte imágenes en una malla GLB; textura, esqueleto y animación opcionales | sí | `tres-d` |
| `animation_actions` | Catálogo de 678 animaciones para esqueletos 3D, con vista previa en GIF | no | `tres-d` |
| `scene_builder_3d_list_projects` | Lista tus proyectos de escena 3D | no | `tres-d` |
| `scene_builder_3d_create_project` | Crea un proyecto de escena 3D privado | no | `tres-d` |
| `scene_builder_3d_get_project` | Lee la revisión, el estado y la operación activa de una escena | no | `tres-d` |
| `scene_builder_3d_query_python` | Inspecciona la escena con Python sin guardar cambios; puede renderizar vistas previas | no | `tres-d` |
| `scene_builder_3d_run_python` | Guarda un cambio en la escena ejecutando Python de Blender | no | `tres-d` |
| `scene_builder_3d_get_operation` | Consulta o espera una operación de Python enviada | no | `tres-d` |
| `scene_builder_3d_search_assets` | Busca modelos en el catálogo curado de GLB | no | `tres-d` |
| `scene_builder_3d_import_asset` | Importa a la escena un modelo del catálogo | no | `tres-d` |
| `scene_builder_3d_get_artifact` | Da el enlace de descarga de un render publicado por una operación | no | `tres-d` |
| `scene_builder_3d_show_scene` | Abre la vista 3D interactiva de la escena para la persona | no | `tres-d` |
| `scene_builder_3d_get_glb` | Da el enlace de descarga del GLB de la escena | no | `tres-d` |
| `scene_builder_3d_get_blend` | Da el enlace de descarga del archivo editable de Blender | no | `tres-d` |
| `scene_builder_3d_generate_angles` | Genera una imagen con IA a partir de un render de la escena | sí | `tres-d` |
| `scene_builder_3d_generate_video` | Genera un video con IA dentro de un proyecto de escena | sí | `tres-d` |
| `scene_builder_3d_get_generation` | Lee el estado y el resultado de una imagen o video generado desde la escena | no | `tres-d` |
| `scene_builder_3d_list_generations` | Historial de imágenes y videos generados en un proyecto de escena | no | `tres-d` |

## Marketing y Ads Studio

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `ads_studio_list_brands` | Lista las marcas de Ads Studio con su estado de investigación | no | `anuncios` |
| `ads_studio_create_brand` | Investiga una marca desde su web y arma su perfil y productos | depende | `anuncios` |
| `ads_studio_get_brand` | Lee una marca y hasta dónde llegó su investigación | no | `anuncios` |
| `ads_studio_list_products` | Lista los productos de una marca o de toda la cuenta | no | `anuncios` |
| `ads_studio_add_product` | Añade un producto desde su página o una descripción | depende | `producto` |
| `ads_studio_get_product` | Lee un producto y si ya terminó de procesarse | no | `producto` |
| `ads_studio_update_product` | Cambia los datos de un producto o lo oculta de la página de marca | no | `producto` |
| `ads_studio_quote` | Cotiza una tanda de anuncios sin lanzar ni reservar nada | no | `anuncios` |
| `ads_studio_generate` | Genera creativos de anuncio con texto e imagen, tras aprobar el precio | sí | `anuncios` |
| `ads_studio_get_run` | Lee una tanda de anuncios, su estado y sus conceptos | no | `anuncios` |
| `ads_studio_list_runs` | Lista las tandas recientes de anuncios | no | `anuncios` |
| `ads_studio_cancel_run` | Cancela una tanda en cola o en curso | no | `anuncios` |
| `ads_studio_list_avatars` | Lista avatares para el reparto de un micro drama | no | `anuncios` |
| `ads_studio_story_presets` | Abre el catálogo de estilos de micro drama | no | `anuncios` |
| `ads_studio_story_recipe` | Devuelve la receta de una tarjeta de micro drama | no | `anuncios` |
| `ads_studio_story_stage` | Muestra una etapa de un micro drama como una rejilla que se actualiza sola | no | `anuncios` |
| `show_marketing_studio_v2` | Abre la galería de plantillas de Marketing Studio | depende | `anuncios` |
| `show_marketing_studio_generations` | Historial de generaciones de Marketing Studio | no | `anuncios` |

## Personajes e influencers

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `ai_influencer_get_options` | Lista los rasgos disponibles para diseñar un influencer | no | `personajes` |
| `ai_influencer_list_presets` | Catálogo de hojas de personaje de ejemplo con sus ajustes | no | `personajes` |
| `ai_influencer_get_settings` | Recupera los ajustes de una hoja de personaje existente | no | `personajes` |
| `ai_influencer_prepare` | Prepara el diseño y cotiza, sin generar | no | `personajes` |
| `ai_influencer_generate` | Genera de 1 a 4 hojas de personaje con los ajustes preparados | sí | `personajes` |
| `build_ai_influencer` | Versión todo en uno del constructor: opciones, catálogo, cotizar y enviar | depende | `personajes` |
| `show_characters` | Personajes Soul: listar, entrenar con 5 a 20 fotos y ver estado | depende | `personajes` |
| `manage_reference_elements` | Elementos reutilizables (personaje, entorno, objeto): listar, leer, crear | depende | `personajes` |
| `show_reference_elements` | Lo mismo, abriendo el visor de elementos | depende | `personajes` |

## Presets

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `get_presets` | Busca y abre presets de las galerías (virales, marketing, Genjutsu, Katana, Soul…) | no | `presets` |
| `get_preset_instructions` | Resuelve un comando o preset y devuelve su receta, sin ejecutarla | no | `presets` |
| `execute_preset` | Ejecuta un preset publicado con las entradas de la persona | sí | `presets` |
| `get_katana_config` | Abre la sesión de una ejecución de Katana, de pago o gratis | depende | `presets` |
| `register_katana_result` | Registra el video final de un preset de Katana como trabajo terminado | no | `presets` |
| `show_katana_result` | Muestra el video final de Katana (visor anterior, se conserva por compatibilidad) | no | `presets` |
| `get_explainer_presets` | Catálogo de estilos para videos explicativos | no | `presets` |
| `resolve_explainer_preset` | Convierte un estilo explicativo en una imagen de referencia utilizable | no | `presets` |
| `register_result` | Registra el video final de Shorts Studio como trabajo terminado | no | `presets` |
| `register_what_if_result` | Registra el video final de un corto "What If" como trabajo terminado | no | `presets` |
| `get_workflow_instructions` | Lista los flujos del servidor o carga las instrucciones de uno | no | `estudio` |
| `get_workflow_bundle_file` | Lee un archivo de apoyo de un flujo | no | `estudio` |

## Edición

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `upscale_image` | Sube una imagen a 2K o 4K | sí | `editar` |
| `upscale_video` | Sube, limpia o restaura un video hasta 4K | sí | `editar` |
| `outpaint_image` | Amplía el lienzo de una imagen a otra proporción | sí | `editar` |
| `reframe` | Cambia la proporción de un video rellenando los bordes | sí | `editar` |
| `remove_background` | Quita el fondo de una imagen o un video | depende | `editar` |
| `motion_control` | Hace que el personaje de una imagen siga el movimiento de un video guía | sí | `editar` |
| `sandbox_exec` | Ejecuta comandos en una máquina en la nube con ffmpeg y otras utilidades | no | `editar` |

## Medios

Subida de archivos y las piezas comunes a cualquier generación.

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `media_upload` | Reserva la subida de uno o varios archivos y da la dirección donde enviarlos | no | `estudio` |
| `media_confirm` | Confirma una subida ya enviada para poder usarla | no | `estudio` |
| `media_import_url` | Importa un archivo desde una URL pública (hasta 50 MB) | no | `estudio` |
| `media_upload_widget` | Abre un cuadro para que la persona suba archivos desde su navegador | no | `estudio` |
| `show_medias` | Lista tus archivos subidos por tipo | no | `cuenta` |
| `models_explore` | Catálogo de modelos: recomendar, buscar y ver límites de cada uno | no | `estudio` |
| `jobs_wait` | Espera hasta 12 trabajos a la vez y devuelve estados y resultados | no | `estudio` |
| `show_generation_by_ids` | Muestra en una sola galería un conjunto exacto de trabajos | no | `estudio` |

## Proyectos y carpetas

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `list_projects` | Lista o busca proyectos accesibles | no | `cuenta` |
| `create_project` | Crea un proyecto privado para guardar generaciones | no | `cuenta` |
| `get_project` | Lee los datos y permisos de un proyecto | no | `cuenta` |
| `update_project` | Cambia nombre, descripción, color, emoji o portada | no | `cuenta` |
| `archive_project` | Archiva un proyecto (reversible) | no | `cuenta` |
| `unarchive_project` | Restaura un proyecto archivado | no | `cuenta` |
| `delete_project` | Borra un proyecto y todo su contenido, sin vuelta atrás | no | `cuenta` |
| `create_folder` | Crea una subcarpeta dentro de un proyecto | no | `cuenta` |
| `list_folders` | Lista las carpetas hijas directas de un nivel | no | `cuenta` |
| `get_folder` | Lee una carpeta por su id | no | `cuenta` |
| `search_folders` | Busca carpetas por nombre en todo el proyecto | no | `cuenta` |
| `move_folder` | Mueve una carpeta dentro del mismo proyecto | no | `cuenta` |
| `rename_folder` | Renombra una carpeta | no | `cuenta` |
| `delete_folder` | Borra una carpeta | no | `cuenta` |
| `list_project_assets` | Lista lo que hay en un proyecto o carpeta (solo metadatos) | no | `cuenta` |
| `get_project_asset_prompt` | Devuelve el prompt con que se hizo un elemento | no | `cuenta` |
| `get_project_asset_source` | Devuelve el enlace de descarga y los datos de un elemento | no | `cuenta` |
| `attach_project_asset` | Coloca en una carpeta algo ya generado o subido | no | `cuenta` |
| `copy_project_asset` | Copia un elemento a otra carpeta o proyecto | no | `cuenta` |
| `move_project_asset` | Mueve un elemento a otra carpeta o proyecto | no | `cuenta` |
| `remove_project_asset` | Saca un elemento del proyecto sin borrar el original | no | `cuenta` |
| `resolve_project_assets` | Localiza dónde está colocado un trabajo o archivo dentro del proyecto | no | `cuenta` |

## Webs/apps/juegos

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `list_website_categories` | Lista las categorías válidas para clasificar un sitio | no | `web-y-juegos` |
| `create_website` | Crea un sitio, una app o un juego con su espacio de trabajo | depende | `web-y-juegos` |
| `website_repo_access` | Prepara el espacio de edición del sitio o envía los cambios guardados | no | `web-y-juegos` |
| `deploy_website` | Construye el sitio y lo deja en su dirección pública | depende | `web-y-juegos` |
| `website_status` | Dice la dirección pública y el estado de la última puesta en línea | no | `web-y-juegos` |
| `publish_website` | Lista en la comunidad de Higgsfield la versión que ya está en línea | no | `web-y-juegos` |
| `rename_website` | Cambia la dirección del sitio; la anterior deja de funcionar | no | `web-y-juegos` |
| `list_websites` | Lista tus sitios con su id, dirección y tipo | no | `web-y-juegos` |
| `website_db` | Consulta en solo lectura la base de datos del sitio | no | `web-y-juegos` |
| `website_secrets` | Lista los nombres de las claves configuradas, nunca sus valores | no | `web-y-juegos` |
| `publish_playable_game` | Publica en la comunidad un juego suelto (anuncio jugable o un HTML) | no | `web-y-juegos` |
| `get_playable_game_publication` | Lee el estado de publicación de un juego suelto | no | `web-y-juegos` |
| `participate_in_contest` | Inscribe un sitio en el concurso vigente con enlaces de redes | no | `web-y-juegos` |
| `apps_search` | Busca apps del Marketplace y las acciones que ofrecen | no | `web-y-juegos` |
| `apps_describe` | Devuelve el contrato de una acción de una app | no | `web-y-juegos` |
| `apps_invoke` | Ejecuta una acción de una app en nombre de la persona | depende | `web-y-juegos` |

## TikTok y publicación

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `tiktok_accounts` | Lista las cuentas de TikTok conectadas y su estado | no | `publicar` |
| `tiktok_connect` | Inicia la conexión de una cuenta de TikTok con un enlace de autorización | no | `publicar` |
| `tiktok_reconnect` | Vuelve a autorizar una cuenta caducada o revocada | no | `publicar` |
| `tiktok_music_trending` | Lista música con licencia comercial en tendencia | no | `publicar` |
| `tiktok_music_tune` | Abre el editor de recorte y volumen de una pista elegida | no | `publicar` |
| `tiktok_prepare_publish` | Valida el archivo y abre el formulario de publicación que envía la persona | no | `publicar` |
| `tiktok_publish_status` | Consulta si una publicación ya se procesó | no | `publicar` |
| `get_project_publication` | Lee los ajustes y el estado de publicación de un proyecto | no | `publicar` |
| `save_project_publication_preview` | Guarda los metadatos de publicación y prepara la vista previa | no | `publicar` |
| `update_project_publication` | Cambia ajustes sueltos de la publicación | no | `publicar` |
| `publish_project` | Publica o republica un proyecto en la galería pública | no | `publicar` |
| `unpublish_project` | Retira un proyecto de la galería pública | no | `publicar` |
| `confirm_project_publication_review` | Aprueba seguir publicando con los elementos marcados ocultos | no | `publicar` |
| `cancel_project_publication_review` | Cancela la revisión de publicación abierta | no | `publicar` |

## Análisis

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `video_analysis_create` | Inicia el desglose escena por escena de un video o un enlace de YouTube | depende | `analizar` |
| `video_analysis_status` | Devuelve el estado y las escenas de un análisis | no | `analizar` |
| `video_analysis_jobs` | Lista los análisis hechos en el espacio de trabajo | no | `analizar` |
| `virality_predictor` | Predice el potencial viral de un video y abre su tablero | depende | `analizar` |

## Cuenta

| Herramienta | Qué hace | Créditos | Skill |
|---|---|---|---|
| `balance` | Créditos disponibles y plan actual | no | `cuenta` |
| `transactions` | Movimientos de créditos: gasto, reembolso, abono, deducción | no | `cuenta` |
| `show_plans_and_credits` | Abre planes y recargas y devuelve los enlaces de pago | no | `cuenta` |
| `cancel_trial_auto_renewal` | Cancela la renovación automática de la prueba gratis, en dos pasos | no | `cuenta` |
| `get_preferences` | Lee si se crea un proyecto automáticamente en cada conversación | no | `cuenta` |
| `update_preferences` | Activa o desactiva esa creación automática | no | `cuenta` |
| `list_workspaces` | Lista los espacios de trabajo y cuál está activo | no | `cuenta` |
| `select_workspace` | Cambia el espacio de trabajo contra el que se cobra y se lee | no | `cuenta` |
| `show_generations` | Historial de generaciones, por páginas | no | `cuenta` |
| `job_display` | Vuelve a mostrar un resultado concreto | no | `cuenta` |
| `show_result` | Muestra un video final con vista previa y descarga | no | `cuenta` |

## Notas

- Las herramientas de generación aceptan consulta previa de costo salvo dentro de una tanda. En edición, la consulta existe para imagen y reencuadre, y no para subir un video de resolución, quitar fondos ni recalcar movimiento.
- Las generaciones ilimitadas de la prueba gratis solo aplican a generar imagen, video y audio. Nunca se activan sin que la persona lo pida.
- Publicar, borrar, cambiar de espacio de trabajo y tocar la facturación solo se hacen a petición expresa.
- El catálogo cambia. Si una herramienta de esta lista falla por no existir, o aparece una que no está, actualiza `scripts/herramientas.txt` y este mapa en la misma revisión.
