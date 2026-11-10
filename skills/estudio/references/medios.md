# Subir y reutilizar medios

`medias[].value` solo acepta un `media_id` (archivo subido) o un `job_id` (resultado de una generación). Una URL ahí falla.

## Archivo local

1. `media_upload` con `filename` (o `files[]` para hasta 20). Devuelve `media_id` y `upload_url`.
2. Sube los bytes. La ruta va entre comillas; el `Content-Type` debe ser el mismo que devolvió o infirió `media_upload`:

   ```bash
   curl -sS -o /dev/null -w "%{http_code}\n" -X PUT \
     -H "Content-Type: image/jpeg" \
     --data-binary @"/ruta/a/foto.jpg" \
     "<upload_url>"
   ```

   Si la respuesta de `media_upload` trae un comando `curl` ya armado, usa ese.
3. Solo si salió `200`: `media_confirm` con `media_id` (o `media_ids`) y `type`: `image`, `video` o `audio`.

El tipo se infiere de la extensión. Documentos y zips suben como archivo general (`type: "file"`) y **no** sirven como entrada de generación.

`media_upload` devuelve también una `url` permanente del archivo. Guárdala: Ads Studio (`images[].url`) y los elementos de referencia la piden en lugar del `media_id`.

## URL pública

`media_import_url` con la URL. Máximo 50 MB. Devuelve el `media_id` listo.

## Widget

`media_upload_widget` abre un cuadro para que la persona suba el archivo. Úsalo solo si no puedes leer el archivo (por ejemplo, un adjunto del chat en claude.ai) o si el PUT falla. Va como **única** herramienta del turno. Para imagen y video mezclados: `type: "auto"`, `multiple: true`.

## Reutilizar

- El resultado de una generación se encadena pasando su `job_id` como `value`.
- Antes de subir de nuevo un archivo que quizá ya subiste, mira `show_medias`.
- Los archivos creados dentro de `sandbox_exec` se suben reservando primero `media_upload` y haciendo el PUT dentro del mismo comando del sandbox.

## Roles

Cada modelo define los roles que acepta en `medias[].role`. Los más comunes son `image_references`, `video_references` y `audio_references`; también hay `start_image`, `end_image`, `input_video`, `input_audio`, `character_images`, `location_image` y `mask`. `image` a secas lo usan Soul y Marketing Studio. Míralos con `models_explore` `action: "get"`.

Si mandas un rol evidente pero mal nombrado, el servidor lo corrige y lo avisa en `adjustments`. Comprobado: `role: "image"` en `gpt_image_2_6` se convierte en `image_references` y la generación sale.

## Formatos que dan problemas

- TikTok rechaza PNG: convierte a JPEG o WebP antes de publicar.
- Un video de más de 15 s en `reframe` necesita `resolution` y `duration_seconds`.
