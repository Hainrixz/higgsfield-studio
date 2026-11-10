---
name: publicar
description: Saca tu trabajo de Higgsfield hacia fuera. Conecta tu cuenta de TikTok, prepara un video o un carrusel de fotos para publicarlo o dejarlo en borradores, busca música con licencia comercial y revisa si la publicación quedó en línea. También publica, actualiza o retira un proyecto de Higgsfield en su galería pública (Cinema). Úsala si dices "súbelo a TikTok", "publícalo en TikTok", "déjalo en borradores", "conecta mi TikTok", "¿qué música está en tendencia?", "¿ya se publicó?", "publica mi proyecto", "dame el enlace público de mi proyecto" o "quita mi proyecto de la galería". EN: publish to TikTok and publish or unpublish a Higgsfield project.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Publicar: lo que sale de tu cuenta

Carga antes la skill `estudio`. Esta skill es distinta de las demás del plugin: **publicar es hacia fuera, lo ve otra gente y no siempre se puede deshacer**. Por eso aquí sí hay paradas.

Regla única: **publicas solo cuando la persona lo pidió, y solo lo que pidió.** Generar un video no autoriza a subirlo. "Hazme un reel para TikTok" es un encargo de video, no una orden de publicar. Si no lo pidieron, entregas el archivo y ofreces publicarlo en una línea.

Lo que sí haces sin preguntar: leer. Ver cuentas conectadas, ver música en tendencia, leer el estado de una publicación.

## Cuándo se activa

- Piden subir algo a TikTok o dejarlo en borradores.
- Piden conectar o reconectar su TikTok.
- Piden publicar, actualizar o retirar un proyecto de Higgsfield, o su enlace público.

Para listar un sitio o un juego en la comunidad, eso lo lleva `web-y-juegos`.

## A. TikTok

### Quién aprieta el botón

`tiktok_prepare_publish` **no publica**: valida el archivo y la cuenta y abre un formulario con vista previa, privacidad, declaraciones y música. **La persona lo revisa y lo envía.** No existe una herramienta para que lo envíes tú, y el servidor prohíbe intentarlo. Esa es la confirmación; no añadas otra encima.

Consecuencia: el formulario necesita un cliente que muestre widgets de Higgsfield (claude.ai o la app de escritorio). El servidor avisa que los clientes sin esa capacidad **no pueden publicar**. En una terminal, prepara el archivo, dilo claro y da el enlace de descarga para subirlo a mano.

### Procedimiento

1. `tiktok_accounts` → cuentas conectadas y su `connector_id`.

   | Resultado | Qué haces |
   |---|---|
   | Hay una cuenta `active` | Sigue |
   | Hay una en `error` | `tiktok_reconnect` con su `connector_id` |
   | No hay ninguna | Ofrece `tiktok_connect` |
   | Hay varias activas | Pregunta cuál |

   `tiktok_connect` y `tiktok_reconnect` devuelven un `authorize_url`: muéstralo como enlace. La persona lo abre, aprueba en TikTok y tú verificas con `tiktok_accounts`. El enlace caduca en unos 10 minutos. `name` solo para una **segunda** cuenta.

2. **Revisa el archivo antes de preparar.** Un archivo rechazado cuesta una vuelta entera de conversión y subida, y TikTok rechaza algunos después de enviados. Límites en `references/tiktok.md`. Lo que más falla:
   - **TikTok rechaza PNG**, y la generación de imágenes de Higgsfield entrega PNG. Convierte a JPEG o WebP.
   - Fotos: deben caber en 1920×1080 o 1080×1920.
   - Video: entre 3 y 600 segundos.

3. **El archivo debe estar alojado en Higgsfield.** TikTok exige un dominio verificado: pasa la URL del resultado de una generación o la de un archivo subido y confirmado. Si convertiste o recortaste, sube el archivo nuevo (como dice `estudio`) y usa esa URL.

4. `tiktok_prepare_publish` con:
   - `connector_id`
   - `mode`: `DIRECT_POST` (al perfil) o `UPLOAD_TO_DRAFT` (a borradores de TikTok). Si no dijeron cuál, pregunta; ante la duda, borradores.
   - `media_type`: `VIDEO` con `video_url`, o `PHOTO` con `photo_images` (hasta 35) y `photo_cover_index` opcional.
   - `title` (hasta 150 caracteres) y `description` opcionales.

   **No rellenes por tu cuenta** `privacy_level`, `allow_comment`, `allow_duet`, `allow_stitch`, `is_aigc` ni `commercial_content_disclosure`: el esquema dice que se pasan solo si la persona ya lo dijo explícitamente. Lo demás lo elige ella en el formulario.

5. La persona envía el formulario. Tú esperas.

6. `tiktok_publish_status` con `connector_id` y el `publish_id` que resulta del envío. TikTok puede tardar unos minutos en procesar. Informa lo que diga el estado, no lo que supongas.

### Música

- `tiktok_music_trending`: pistas en tendencia de la biblioteca comercial de TikTok, con enlace para escucharlas. Filtros: `genre`, `country_code` (por defecto `US`), `date_range` (`1DAY`, `7DAY`, `30DAY`, `90DAY`). **No hay búsqueda por palabra**: ofrece filtros.
- `tiktok_music_tune`: abre el editor de una pista ya elegida (recorte y volúmenes). Pásale los mismos filtros con que se encontró.

Las dos son de consulta: **lo que se elija ahí no se aplica a la publicación**. La música se selecciona y ajusta dentro del formulario de `tiktok_prepare_publish`. Y solo funciona con `DIRECT_POST`: los borradores de TikTok no la conservan.

## B. Publicar un proyecto de Higgsfield

Publicar un proyecto lo pone en la galería pública de Higgsfield (Cinema) con un enlace. Puede exponer sus **prompts** y su **lienzo**. Todas las herramientas piden `workspace_id` y `project_id` (sácalos con la skill `cuenta`).

El servidor exige aprobación explícita de la persona antes de **cada** cambio. No es un freno nuestro: es su regla, y la cumplimos tal cual.

### Procedimiento

1. `get_project_publication` → ajustes actuales, qué se expone, instantánea y estado de moderación. No cambia nada.
2. **Muestra** a la persona el estado actual y el resultado exacto de lo que propones, con las tres visibilidades:
   - `show_prompts`: los prompts se ven en público.
   - `show_canvas`: el lienzo se ve en público.
   - `is_discoverable`: aparece en el descubrimiento. En `false` **el enlace sigue siendo público**.
3. Con su sí explícito **y** su confirmación de que tiene derechos sobre el contenido: `publish_project` con `settings` (esas tres son obligatorias).
4. `get_project_publication` otra vez. Informa el estado observado y el `public_url`. Una respuesta "aceptada" no es una publicación terminada.

| Quieren | Herramienta |
|---|---|
| Ver cómo está | `get_project_publication` |
| Guardar título, portada, descripción | `save_project_publication_preview` |
| Cambiar un ajuste suelto | `update_project_publication` |
| Publicar o republicar | `publish_project` |
| Retirar de la galería | `unpublish_project` (no borra el proyecto ni sus archivos) |
| Seguir adelante ocultando lo marcado por moderación | `confirm_project_publication_review` |
| Cancelar una revisión abierta | `cancel_project_publication_review` |

Trampas reales, con detalle en `references/proyecto-publico.md`:

- `save_project_publication_preview` y `update_project_publication` **pueden cambiar lo que ya es público en el acto**. No son un borrador privado.
- Renombrar el proyecto de trabajo no cambia el título público ni la dirección. Son tres cosas distintas.
- Si moderación marca algo (`awaiting_confirm`), enseña la lista completa y pide una decisión **nueva**. Nunca confirmes solo.
- No prometas que los chats quedan fuera: no hay control para eso.
- Tras una respuesta dudosa, **no repitas**: lee el estado.

## Errores comunes

- **Publicar porque "era para TikTok".** Sin petición expresa, no.
- **Mandar un PNG.** Rechazo seguro.
- **Pasar una URL externa.** Debe ser de Higgsfield.
- **Decir "ya está publicado" tras abrir el formulario.** Falta que la persona lo envíe y que TikTok lo procese.
- **Elegir música con las herramientas de música y creer que quedó puesta.**
- **Rellenar privacidad o la declaración de contenido con IA por defecto.**
- **Reintentar una publicación de proyecto tras un timeout.**

## A dónde ir

| Quieren | Skill |
|---|---|
| Convertir, recortar o pasar a 9:16 antes de publicar | `editar` |
| Saber si el video tiene gancho antes de subirlo | `analizar` |
| Listar un sitio o juego en la comunidad | `web-y-juegos` |
| Encontrar el proyecto y su espacio de trabajo | `cuenta` |
