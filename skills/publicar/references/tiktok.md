# TikTok: límites y detalles

Última revisión: noviembre 2026, leído del esquema de `tiktok_prepare_publish` y sus herramientas hermanas.

## Límites de archivo

Compruébalos **antes** de llamar. TikTok rechaza algunos archivos de forma asíncrona, cuando la publicación ya se envió.

### Fotos (`media_type: "PHOTO"`)

| Regla | Valor |
|---|---|
| Formato | JPEG o WebP. **PNG se rechaza** |
| Peso | Hasta 20 MB cada una |
| Tamaño | Debe caber en 1920×1080 o en 1080×1920 |
| Cantidad | Hasta 35 imágenes |

La generación de imágenes de Higgsfield entrega PNG: convierte siempre antes de publicar fotos.

### Video (`media_type: "VIDEO"`)

| Regla | Valor |
|---|---|
| Formato | MP4, WebM o MOV |
| Peso | Hasta 1 GB |
| Duración | De 3 a 600 segundos |
| Tamaño | Al menos 360 px en ambos lados |
| Fotogramas | De 23 a 60 fps |

## Convertir y volver a alojar

El archivo final tiene que vivir en Higgsfield. Dos caminos:

**En tu máquina (Claude Code):**

```bash
ffmpeg -y -i entrada.png -vf "scale='min(1080,iw)':'min(1920,ih)':force_original_aspect_ratio=decrease" -q:v 2 salida.jpg
```

Luego `media_upload` → PUT → `media_confirm` con `type: "image"`, y usa la URL que queda confirmada.

**En el sandbox de Higgsfield:** reserva con `media_upload`, y en un solo `sandbox_exec` descarga, convierte y haz el PUT. Detalle en la skill `editar`, `references/sandbox.md`.

Para saber duración, tamaño y fps de un video: `ffprobe`.

## Parámetros de `tiktok_prepare_publish`

| Parámetro | Notas |
|---|---|
| `connector_id` | Obligatorio. Cuenta `active` de `tiktok_accounts` |
| `mode` | Obligatorio. `DIRECT_POST` o `UPLOAD_TO_DRAFT` |
| `media_type` | Obligatorio. `VIDEO` o `PHOTO` |
| `video_url` | Obligatorio para video. URL alojada en Higgsfield |
| `photo_images` | Obligatorio para fotos. De 1 a 35 URLs alojadas en Higgsfield |
| `photo_cover_index` | Cuál foto es la portada (empieza en 0) |
| `title` | Texto del pie, hasta 150 caracteres |
| `description` | Hasta 4000 caracteres |
| `privacy_level` | `PUBLIC_TO_EVERYONE`, `MUTUAL_FOLLOW_FRIENDS`, `FOLLOWER_OF_CREATOR`, `SELF_ONLY`. Solo si la persona lo dijo |
| `allow_comment`, `allow_duet`, `allow_stitch` | Solo si la persona lo dijo |
| `is_aigc` | Si el contenido es generado por IA. Solo si la persona lo dijo |
| `commercial_content_disclosure` | `enabled`, `your_brand`, `branded_content`. Solo si la persona lo dijo |

Los que dicen "solo si la persona lo dijo" son prellenados del formulario. Dejarlos vacíos no bloquea nada: la persona los marca al revisar.

Sobre `is_aigc`: si el contenido salió de Higgsfield, recuérdale a la persona que TikTok pide declararlo, y que lo marque ella en el formulario.

## Modos

| Modo | Qué pasa | Música |
|---|---|---|
| `DIRECT_POST` | Se publica en el perfil | Sí, elegida en el formulario |
| `UPLOAD_TO_DRAFT` | Queda en los borradores de TikTok; la persona termina desde la app | No se conserva |

## Cuentas

`tiktok_accounts` no pide parámetros. Devuelve `accounts`, cada una con `connector_id` y estado. Una lista vacía significa que no hay nada conectado.

| Estado | Significa |
|---|---|
| `active` | Lista para usar |
| `error` | Acceso caducado o revocado: `tiktok_reconnect` |

Para conectar una segunda cuenta, `tiktok_connect` con un `name` distinto (por ejemplo `tiktok-marca`).

## Música

`tiktok_music_trending` (`connector_id` obligatorio):

| Parámetro | Por defecto |
|---|---|
| `genre` | `ALL`. Otros: `POP`, `HIP_HOP/RAP`, `LO-FI`, `EDM`, `COUNTRY`, `K-POP`, `CHILL_BEATS`, `EPIC`… |
| `country_code` | `US` |
| `date_range` | `7DAY` |
| `limit` | 10 (máximo 100) |
| `offset` | 0 |

`tiktok_music_tune` pide `connector_id` y `music_sound_id`, más los mismos `genre`, `country_code` y `date_range` usados al encontrar la pista; si no coinciden, puede no encontrarla.

Ninguna de las dos aplica nada a la publicación. Sirven para explorar y decidir; la elección real se hace en el formulario de publicación.

## Estado

`tiktok_publish_status` pide `connector_id` y `publish_id`. El `publish_id` nace cuando la persona envía el formulario. Si no lo tienes, no lo inventes: pídele que confirme que envió y revisa lo que devolvió el formulario.
