# Publicar un proyecto de Higgsfield

Última revisión: noviembre 2026, leído de los esquemas de las siete herramientas de publicación. Todas piden `workspace_id` y `project_id`.

## Tres nombres que no son lo mismo

| Cosa | Dónde vive | Cambia con |
|---|---|---|
| Nombre del proyecto de trabajo (privado) | El proyecto | `update_project` (skill `cuenta`) |
| Título público | `settings.name` | Las herramientas de publicación |
| Dirección pública | `settings.slug` | Las herramientas de publicación |

Renombrar el proyecto de trabajo no cambia ni el título público ni la dirección. Si piden "el enlace para compartir", conserva el `slug` que ya exista; propón uno nuevo solo si no hay o si piden cambiar la dirección, y verifica `public_url` al terminar.

## `settings`

| Campo | Qué es |
|---|---|
| `show_prompts` | Los prompts se muestran en público |
| `show_canvas` | El lienzo se muestra en público |
| `is_discoverable` | Aparece en el descubrimiento. En `false` el enlace **sigue siendo público** |
| `name` | Título público |
| `slug` | Dirección pública |
| `description` | Hasta 500 caracteres |
| `tags` | Etiquetas |
| `type` | `film`, `series` o `carousel` |
| `is_ongoing` | Si la obra sigue en curso |
| `cover` | Portada: `type` (`media`, `video` o `job`), `id`, `width`, `height`; opcional `object_fit` (`cover` o `contain`) |
| `gallery_media` | Lista de medios de galería, con la misma forma que `cover` |
| `social_post_url` | Enlace a una publicación en redes |
| `author_user_ids` | Autores |

En `publish_project`, `show_prompts`, `show_canvas` e `is_discoverable` son **obligatorios** y deben ser decisiones explícitas de la persona. Los valores por defecto del servidor son `true`: no los dejes pasar sin decirlo.

En `update_project_publication`, lo que omites no cambia; `null` borra el campo.

## Qué hace cada herramienta

| Herramienta | Efecto | Cuidado |
|---|---|---|
| `get_project_publication` | Lee ajustes, exposición, instantánea y moderación | No es un recibo de la última operación: solo el estado actual |
| `save_project_publication_preview` | Guarda metadatos y prepara los datos de vista previa | Puede cambiar metadatos ya públicos. No abre una vista renderizada: da un enlace solo si lo devuelve |
| `update_project_publication` | Guarda ajustes parciales | Puede cambiar visibilidad pública en el acto |
| `publish_project` | Guarda los metadatos y pide la publicación | Captura el contenido actual de forma asíncrona. No queda atado a una vista previa anterior |
| `unpublish_project` | Retira la publicación | No borra el proyecto ni sus archivos. No es lo mismo que cancelar una revisión |
| `confirm_project_publication_review` | Aprueba publicar con lo marcado **oculto** | Exige una decisión nueva de la persona sobre la lista completa |
| `cancel_project_publication_review` | Cancela la revisión abierta | No deshace metadatos ya guardados ni retira una publicación existente |

## Aprobación

El servidor lo exige para todas las que cambian algo: aprobación explícita de la persona, no deducida. Antes de pedirla, enséñale:

1. Los ajustes actuales.
2. Qué contenido quedaría expuesto.
3. Las tres visibilidades tal como quedarían.
4. Si hay elementos marcados por moderación.

Para `publish_project` hacen falta dos cosas: el sí a publicar **y** la confirmación de que tiene derechos o permiso sobre el contenido.

## Moderación

- La moderación pendiente corre sola: espera y lee el estado.
- Solo `awaiting_confirm` requiere una decisión: seguir con lo marcado oculto (`confirm_project_publication_review`) o cancelar (`cancel_project_publication_review`).
- Nunca confirmes automáticamente después de publicar, actualizar o previsualizar.
- Si la lista de marcados llega incompleta, hay que resolverlo en la web de Higgsfield.

## Leer el resultado con honestidad

- Di que quedó publicado solo cuando el estado leído lo muestre. "Petición aceptada" no basta.
- La captura puede incluir cambios hechos mientras la publicación estaba en curso. Después de una instantánea terminada, los cambios posteriores en el proyecto exigen republicar.
- Al republicar, compara `snapshot_id` y el estado de procesamiento con la lectura anterior. Un `snapshot_id` igual puede significar "ya estaba servido lo actual" o "sigue la versión vieja mientras se procesa": no deduzcas "pendiente" de eso.
- Si hay duda sobre qué operación produjo el estado, dilo.
- `show_canvas` no dice si los chats quedan ocultos. No hay un control de privacidad de chats ni un inventario completo de lo que compone la publicación: no prometas que los chats se excluyen.

## Si la respuesta fue dudosa

Para. Lee `get_project_publication`. No hay recibo por operación ni garantía de repetición segura: repetir a ciegas puede publicar o cambiar algo dos veces.
