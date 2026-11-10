# 3D Jutsu: el detalle

Última revisión: noviembre 2026. Resume lo que devuelve `get_preset_instructions` con `{preset: "/3d-jutsu"}`. Ese texto manda; cárgalo siempre antes de construir.

## Los dos números que protegen cada cambio

- `revision`: la versión guardada.
- `sceneSequence`: el estado asentado de la escena contra el que escribiste tu código.

Nunca se adivinan. Salen de `scene_builder_3d_get_project` o de una consulta con `scene_builder_3d_query_python` (`revisionBefore` y `sceneSequenceAfter`).

Un proyecto autorizado con `exists: false` es una escena vacía válida en la revisión 0, no un error.

## `operationId`

Es una clave de idempotencia. Elige una descriptiva y estable (`add-key-light-01`). Reutilízala **solo** para reintentar el mismo código contra los mismos valores.

## Un cambio a la vez

Una sola mutación activa por proyecto, importaciones incluidas. Si sigue activa, espera con `scene_builder_3d_get_operation` (`waitSeconds` hasta 30) usando los mismos ids.

| Qué pasó | Qué haces |
|---|---|
| `succeeded` | `revisionAfter` es la nueva cabeza |
| Excepción de Python | Lee el mensaje y `output.stderrTail`, corrige el código |
| `EXECUTION_TIMEOUT` | No se guardó nada. Reintenta solo con trabajo más barato o partido |
| `CONTAINER_UNAVAILABLE` u otro transitorio | No se guardó nada. Reenvía el mismo código con un `operationId` nuevo y los mismos valores |
| Conflicto de estado (`REVISION_CONFLICT`) | No repitas el código ni esperes esa operación. Consulta de nuevo y regenera el cambio con valores frescos y otro `operationId` |
| `OPERATION_NOT_FOUND` | Para. Verifica los ids y lee el proyecto |

Lee `error.code`, `error.retryable` y `error.retryAdvice` antes de reintentar.

## El runtime

- `bpy` 5.2, sin interfaz. Motores válidos: `BLENDER_EEVEE`, `BLENDER_WORKBENCH`, `CYCLES`. No existe `BLENDER_EEVEE_NEXT`.
- Cada operación tiene un plazo (hoy cerca de cinco minutos) y el código un tope de 256 KiB. Los renders son lo caro: resolución y muestras pequeñas, y parte las construcciones grandes.
- **Sin red.** No descargues URLs ni incrustes bytes de modelos o imágenes en el Python.
- Cada operación empieza desde la escena asentada. Busca los objetos por nombre.
- Asigna a `result` un valor corto y serializable: nombres, conteos y medidas que necesites después.
- `BLENDER_WORKBENCH` ignora las luces: solo prueba la forma.

## Sacar un archivo de una operación

`artifacts` es la única salida:

```python
target = artifacts.file(name="preview.png", media_type="image/png")
scene.render.filepath = str(target.path)
scene.render.image_settings.media_type = "IMAGE"  # antes de file_format
scene.render.image_settings.file_format = "PNG"
bpy.ops.render.render(write_still=True)
target.publish()  # lo que no se publica se descarta
```

Máximo ocho archivos por operación (`image/png`, `image/jpeg`, `video/mp4`). Un tipo que no coincide o un archivo ausente hace fallar toda la operación.

Recupéralos con `scene_builder_3d_get_artifact`, pasando el `operationId` (si viene de una consulta) o la `revision` (si viene de un cambio guardado). El enlace es de vida corta.

## Construir una escena, no un guion

- Escala en metros. Se juzga desde la cámara de entrega.
- Nombra por rol: `HERO_robot`, `ENV_floor`, `CAM_main`, `LGT_key`.
- El primer bloqueo pone la cámara de entrega y una luz de trabajo: ambiente modesto, una luz principal motivada, un relleno suave. Usa Sun, Spot o Point: la vista de escena y el GLB descartan las luces Area.
- De grueso a fino: silueta, proporción, profundidad, contacto (nada flota ni se atraviesa), lectura de cámara, detalle.

Referencias que se cargan con `get_preset_instructions` cuando toca esa etapa:

| Referencia | Antes de |
|---|---|
| `/3d-jutsu/references/scene-building` | Cualquier escena con varios objetos |
| `/3d-jutsu/references/composition-modeling` | Geometría detallada o exportar GLB |
| `/3d-jutsu/references/lookdev-lighting` | Materiales, texturas o luz más allá de la de trabajo |
| `/3d-jutsu/references/animation-audit` | Fotogramas clave, movimiento de cámara, bucles, giros |
| `/3d-jutsu/references/location-new-angles` | Nuevas vistas de un lugar a partir de una imagen |

## Modelos de catálogo

1. `scene_builder_3d_search_assets` con `projectId` y `search`.
2. `scene_builder_3d_import_asset` con el `assetId` y el `catalogSearch` copiados de `importArguments`.
3. Si `settled` es falso, consulta `scene_builder_3d_get_project` hasta que `appliedSceneSequence` alcance `targetSceneSequence`.
4. Inspecciona medidas, posición y orientación antes de seguir editando.

No repitas la importación para "ver si ya está": crea un duplicado. Si falla, informa; no hay plan B con descargas en Python. Las coordenadas del editor son glTF (metros, Y arriba); `bpy` usa Z arriba.

## Imagen o video con IA desde la escena (de pago)

| Herramienta | Qué pide |
|---|---|
| `scene_builder_3d_generate_angles` | `projectId`, `requestId` (UUID), `operationId` y `artifactId` de un render ya revisado, `prompt`. Opcional: `aspectRatio`, `resolution` (`1k`, `1.5k`, `2k`), `referenceMediaId` |
| `scene_builder_3d_generate_video` | `projectId`, `requestId`, `prompt`. Opcional: `operationId` + `artifactId` como fotograma inicial, `duration` (4–30), `resolution` (`480p`, `720p`, `1080p`), `aspectRatio`, `generateAudio`, `draft` |

Reglas:

- `requestId` es la protección contra el doble cobro. Tras una respuesta dudosa se repite **el mismo** `requestId` con los mismos argumentos; uno nuevo es otra generación de pago.
- Seguimiento con `scene_builder_3d_get_generation`. `succeeded` y `failed` son finales. Si devuelve `submission_unknown`, léelo una vez y, si sigue sin confirmar, para y avisa.
- La escena no cambia al generar.
- El historial está en `scene_builder_3d_list_generations`.

## Mostrar y cerrar

`scene_builder_3d_show_scene` una vez por entrega, con el `projectId` y la revisión final exacta (`revisionAfter` del último cambio, o la revisión asentada tras una importación). No repitas una revisión que no cambió. Si el cliente no muestra widgets, da el `projectUrl` que devuelve.

El widget es para la persona: a ti no te da evidencia visual. Tu verificación es el render más `scene_builder_3d_get_artifact`.
