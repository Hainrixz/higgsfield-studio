---
name: tres-d
description: Modelos y escenas 3D con Higgsfield. Convierte una imagen (o varias vistas del mismo objeto) en una malla GLB, le pone textura, esqueleto y una animación de catálogo, y arma escenas 3D completas con cámara y luces (3D Jutsu) de las que salen renders, nuevos ángulos de un lugar, video y archivos GLB o Blender. Úsala si dices "pásame esto a 3D", "hazme un modelo 3D de este producto", "necesito el GLB", "ponle huesos a este personaje", "que camine", "arma una escena 3D", "saca otro ángulo de este lugar", "dame el archivo de Blender" o "3D Jutsu". EN: image to 3D mesh, rigging, animation and hosted 3D scenes on Higgsfield.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# 3D: modelos y escenas

Carga antes la skill `estudio`. Aquí hay dos trabajos distintos y conviene no mezclarlos:

- **Un objeto suelto** → `generate_3d`: de una imagen sale una malla GLB.
- **Una escena** (varios objetos, cámara, luces, animación) → 3D Jutsu, con las herramientas `scene_builder_3d_*`.

Pedir el modelo ya es la autorización. El 3D es de lo caro: consulta el costo con `get_cost: true`, dilo en una línea y lanza.

## Cuándo se activa

- Tienen una foto o un render y quieren el objeto en 3D, con o sin textura, esqueleto o animación.
- Quieren montar o editar una escena 3D, o sacar nuevas vistas de un lugar que ya tienen en imagen.
- Piden un archivo `.glb` o `.blend`.

Solo criticar una imagen no activa trabajo de escena.

## A. Un modelo con `generate_3d`

### Qué modelo

| Tienes | Modelo |
|---|---|
| Una imagen, uso general (textura, PBR, esqueleto opcionales) | `image_to_3d` |
| De 2 a 4 vistas del mismo objeto (mejor geometría) | `multi_image_to_3d` |
| Un objeto dentro de una foto con más cosas | `sam_3_3d` (acepta `prompt` para decir cuál) |
| Un GLB que ya existe y quieres ponerle esqueleto | `3d_rigging` |

Hay más (texto a 3D, remallado, retexturizado, cuerpo humano): están en `references/modelos-3d.md`. Ante la duda, `models_explore` con `type: "3d"`.

### Procedimiento

1. **Sube la imagen** como dice `estudio`. En `medias`, `role: "image"` para los modelos de la tabla.
2. **Arregla la imagen antes, no después.** La malla reproduce solo lo que hay en la imagen. Si quieren otra ropa, un accesorio o quitar algo, edita la imagen con `generate_image` (skill `imagen`) y convierte el resultado.
3. **Decide los extras** y ponlos al nivel superior de `params`, junto a `model`:
   - `should_texture: true` para textura (por defecto sale sin ella y cuesta más con ella). `enable_pbr` necesita textura.
   - `enable_rigging: true` para esqueleto. Funciona bien en personajes humanoides; en animales y objetos suele salir mal: avísalo. Con esqueleto conviene `pose_mode` `a-pose` o `t-pose`.
   - `enable_animation: true` necesita `enable_rigging` y un `animation_action_id`.
4. **Consulta el costo** con `get_cost: true` (cada extra suma) y dilo.
5. **Lanza** sin `get_cost`, espera con `jobs_wait` y entrega el GLB.

### Animación de catálogo

`animation_actions` es un catálogo de solo lectura con 678 acciones. Busca con `query` ("walk", "backflip") o filtra por `group` (`WalkAndRun`, `BodyMovements`, `DailyActions`, `Dancing`, `Fighting`) y `category`. Cada resultado trae `id`, `name` y un `preview_url` (GIF).

Atajos que da el catálogo: reposo `0`, caminar `30`, correr `16`, saltar `466`, saludar `28`, bailar `64`. Si varias acciones encajan (hay muchas variantes de caminar), muestra los GIF y que elija la persona; no escojas a ciegas.

### Ponerle esqueleto a un GLB que ya existe

`3d_rigging` **no recibe imágenes ni `job_id`**: recibe `model_url`, la URL pública HTTPS del GLB.

- De una generación anterior: usa la URL del resultado, no su id.
- De un GLB hecho en el sandbox o que tiene la persona: `media_upload` con nombre `.glb` → PUT → `media_confirm` con `type: "file"`, y pasa la `url` que devolvió `media_upload`, **nunca** su `upload_url`.

Opcionales: `height_meters` (1.7 por defecto), `enable_animation` y `animation_action_id`.

## B. Una escena con 3D Jutsu

**Primero, siempre:** `get_preset_instructions` con `{preset: "/3d-jutsu"}`. Lo pide el servidor antes de construir o editar, una vez por conversación. Trae el flujo, los límites y las referencias. Para sacar nuevas vistas de un lugar a partir de una imagen, carga además `/3d-jutsu/references/location-new-angles` antes de construir.

La escena vive en Higgsfield y se edita mandando Python (`bpy`); no se instala nada en la computadora de la persona. Háblale de su escena, su render y su archivo, no de contenedores.

### Orden real de las llamadas

1. **Elegir proyecto.** Existente: `scene_builder_3d_list_projects`. Nuevo: `scene_builder_3d_create_project` una sola vez. Guarda el `projectId`: va en **todas** las llamadas, no hay proyecto activo.
2. `scene_builder_3d_get_project` → revisión actual, secuencia de escena y si hay una operación en curso.
3. `scene_builder_3d_query_python` → inspeccionar nombres, medidas, cámaras, luces. No guarda nada; úsalo sin miedo.
4. `scene_builder_3d_run_python` → un cambio coherente, con `revision` = `revisionBefore` y `expectedSceneSequence` = `sceneSequenceAfter` de la consulta, y un `operationId` descriptivo.
5. `scene_builder_3d_get_operation` → si sigue activa, esperar con los mismos ids. Solo `succeeded`, `failed`, `timed_out` y `expired` son finales.
6. **Mirar el resultado:** render pequeño desde la cámara de entrega publicado con `artifacts`, `scene_builder_3d_get_artifact` y revisar la imagen. Que el código corra no prueba que la escena esté bien.
7. `scene_builder_3d_show_scene` **una vez** al cerrar, con la revisión final exacta.

Modelos de catálogo: `scene_builder_3d_search_assets` → `scene_builder_3d_import_asset` copiando sus `importArguments`. Solo entra catálogo; no se puede importar un archivo propio.

Detalle, errores y reglas del runtime en `references/escenas.md`.

### Qué gasta créditos

| Paso | Créditos |
|---|---|
| Crear proyecto, consultar, editar, importar, renderizar, mostrar | El servidor no los marca como de pago |
| `scene_builder_3d_generate_angles` (imagen con IA desde un render) | **Sí** |
| `scene_builder_3d_generate_video` (video Seedance 2.5 desde un render) | **Sí** |

Las dos de pago se usan solo si pidieron una imagen o un video con IA de la escena, con un render ya revisado, y se siguen con `scene_builder_3d_get_generation`. No tienen consulta previa de costo: dilo antes de lanzar.

### Descargas

- `scene_builder_3d_get_glb`: modelo portable. Los shaders procedurales y la luz de mundo no siempre viajan al GLB.
- `scene_builder_3d_get_blend`: archivo editable de Blender.

Ambos dan un enlace de vida corta: descárgalo enseguida. Solo cuando la persona quiera los archivos.

## Errores comunes

- **Pasar un `job_id` a `3d_rigging`.** Quiere `model_url`.
- **Pedir animación sin esqueleto.** `enable_animation` exige `enable_rigging`.
- **Esperar que el 3D invente lo que la foto no muestra.** Edita la imagen primero.
- **Crear el proyecto dos veces** tras una respuesta dudosa. Lista antes de reintentar.
- **Reenviar una generación de escena con un `requestId` nuevo.** Cobra dos veces: se reintenta con el mismo `requestId` y los mismos argumentos.
- **Editar con una revisión adivinada.** Vuelve a consultar y usa los valores reales.
- **Dar la escena por buena sin verla.** Si no puedes ver el render, di qué queda sin verificar.

## A dónde ir

| Quieren | Skill |
|---|---|
| Preparar o corregir la imagen de partida | `imagen` |
| Fotos de producto en 2D | `producto` |
| Un juego de navegador con modelos 3D | `web-y-juegos` |
| Animar una imagen en video, sin malla | `animar` |
