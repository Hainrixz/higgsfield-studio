# Ads Studio, campo por campo

Leído del workflow `ads-studio` (versión 1.2) y de los esquemas en vivo (noviembre 2026). El workflow manda: cárgalo con `get_workflow_instructions` antes de la primera llamada de cada conversación.

Ads Studio hace creativos **estáticos**: escribe el copy y renderiza la imagen. No hace video, no diseña logos y no es el kit de marca de Marketing Studio (son cosas distintas con nombre parecido).

## Las herramientas

| Herramienta | Para | Parámetros |
|---|---|---|
| `ads_studio_list_brands` | Marcas de la cuenta con su estado y número de productos | ninguno |
| `ads_studio_create_brand` | Investigar una marca desde su web | `input`: URL, o nombre si no hay URL |
| `ads_studio_get_brand` | Estado de la investigación | `brand_id` |
| `ads_studio_add_product` | Añadir un producto, con o sin marca | `url`, `text`, `images` (hasta 8 enlaces), `brand_id`, `overwrite` (ids a refrescar) |
| `ads_studio_get_product` | Estado de un producto | `product_id` |
| `ads_studio_list_products` | Productos de una marca o de toda la cuenta | `brand_id`, `cursor`, `include_unpicked` |
| `ads_studio_update_product` | Corregir un producto u ocultarlo | `brand_id`, `product_id` y los campos a cambiar |
| `ads_studio_quote` | Precio, sin gastar | los mismos que generar, sin llave |
| `ads_studio_generate` | Lanzar | ver abajo; `idempotency_key` obligatorio |
| `ads_studio_get_run` | Estado de un run y sus conceptos | `run_id` |
| `ads_studio_list_runs` | Runs recientes | `brand_id`, `limit` |
| `ads_studio_cancel_run` | Cancelar un run | `run_id`; solo si lo piden |

## Los estados

**Marca** (`ads_studio_get_brand`): `running` sigue investigando; `done` con `profile_ready: true` está lista; `failed` trae `research_error`. Pasa por cinco etapas: gather, synthesis, enrichment, products, assets. Un fallo parcial (`gather_error`, `enrichment_error`, `products_error`) con `status: done` deja un perfil usable: di qué falta.

**Producto** (`ads_studio_get_product`): `queued`, `in_progress`, `completed`, o `failed` con `fail_reason`.

**Producto de una marca** (`ads_studio_list_products`): `texts_ready: false` significa que el copy aún no está escrito.

**Run** (`ads_studio_get_run`): un run en cola dice su lugar en la fila; uno cancelado no es un fallo; `done` con `still_rendering: true` todavía no está listo. Cada concepto trae `headline`, `primary_text`, `cta`, `destination_url` y `has_picture`. Un creativo se nombra por su `concept_id`.

## Argumentos de cotizar y generar

| Campo | Qué es |
|---|---|
| `product_ids` | Productos a anunciar, de cualquier marca o de ninguna. Cada uno es un run. Máximo 24 |
| `include_brand` | Un run sobre la marca en sí. Necesita `brand_id` y el kit activo |
| `prompt` | Lo que pidió la persona, con sus palabras: ángulo, oferta, público. Máximo 2000 caracteres |
| `brand_id` | La marca cuyo kit (logo, paleta, tono) da forma a los anuncios. Se omite para anuncios sin kit |
| `brand_kit` | `false` para anunciar un producto de la marca sin su look |
| `images` | Hasta 4 enlaces públicos: `role: "product"` (foto de lo anunciado) o `role: "style"` (un look a seguir, valor por defecto) |
| `total` | Conceptos en total entre todos los sujetos. "Dos productos, tres anuncios cada uno" es `total: 6` con dos `product_ids`. Máximo 100 |
| `aspect_ratio` | `1:1` (defecto), `9:16`, `16:9`, `3:4`. Mándalo siempre |
| `objective` | `sales`, `leads`, `traffic`, `awareness`, `engagement`. Solo si la meta quedó clara |
| `idempotency_key` | Solo en generar. Cualquier cadena única, hasta 128 caracteres |
| `expected_credits` | Solo en el reintento tras `approval_required`: el costo exacto que aprobó la persona |

Hace falta al menos uno de `product_ids`, `include_brand` o `prompt`. El kit de una marca solo llega a **sus** productos: no prometas el look de una marca sobre el producto de otra. `picked_for_ads` decide qué muestra la página de la marca en la web, no qué se anuncia.

Un `prompt` solo, sin producto ni marca, es la excepción que no necesita ficha: va directo a cotizar y generar, y sale tan específico como el prompt.

## Las fotos van como enlace, no como `media_id`

Ads Studio descarga cada imagen desde un enlace https público. Es al revés que el resto del plugin, donde `medias[].value` nunca es una URL.

- Archivo local: súbelo como dice `estudio` y pasa la `url` que devuelve la confirmación.
- Adjunto del chat que no puedes leer: `media_upload_widget` como única herramienta del turno.
- Un enlace que Ads Studio no puede leer se rechaza: pide la página del producto o un enlace público.

## Cuando la app manda una `allocation`

Si el mensaje viene de la app de Ads Studio con cantidades exactas por producto, el botón "Continuar" de la app **no** es aprobación de gasto. Pasa la `allocation` completa a `ads_studio_generate` en una sola llamada con su `brand_id`, `aspect_ratio` e `idempotency_key`, sin `product_ids`, `total`, `prompt`, `images`, `objective`, `include_brand` ni `brand_kit`. El servidor cotiza y pide confirmación nativa si el cliente la soporta; si no, devuelve `approval_required` y `credits`: muestra cantidades y costo, pregunta una vez y para. Tras el sí, repite la misma petición con `expected_credits` igual al costo aprobado. No partas la `allocation` ni cambies la llave. Si responde `QUOTE_CHANGED`, pide cotización y aprobación nuevas, sin `expected_credits`.

Si una tarjeta manda un mensaje que empieza por "Use this product for Ads Studio ads", la persona ya eligió ese producto: no listes ni investigues de nuevo. `ads_studio_get_product` una vez; si está `completed`, cotiza con esos ids.

## Qué hacer con cada respuesta

| Respuesta | Qué haces |
|---|---|
| `needs_confirmation: true` al crear marca | Confirma `suggested_website` y vuelve a llamar con la URL. No arrancó nada |
| Marca `failed` | Explica `research_error` y ofrece investigar la web otra vez |
| Marca `failed` con su producto `completed` | El producto sirve sin kit: dilo y cotízalo solo si quieren |
| Producto `failed` | Di el `fail_reason`. Ofrece reintentar con `overwrite` o pide descripción y foto. No cotices |
| Producto atascado en `queued`, o `completed` con `images_count: 0` desde una página | Sin leer o sin imágenes. Refresca con `overwrite` o pide descripción y foto |
| `partial: true` al generar | Unos runs arrancaron y se cobraron: reporta esos `run_ids`. Los de `not_started` no se cobraron; di el `not_started_reason`. Si aún los quieren, genera **solo esos** con llave nueva |
| `error_code: ADS_STUDIO_UNAVAILABLE` tras generar | Puede haberse aceptado. `ads_studio_list_runs` antes de nada; nunca reintentes con llave nueva |
| Faltan créditos, cuota o cola llena | Di los números que trae la respuesta. No bajes la cantidad ni cambies productos por tu cuenta |
| Piden editar, variar o cambiar el look de un creativo | No está en estas herramientas: se hace en la web de Ads Studio |

## Lo que nunca

- Consultar `ads_studio_get_brand`, `ads_studio_get_product`, `ads_studio_get_run` o `ads_studio_list_products` en bucle. Las tarjetas se actualizan solas; tú lees una vez por turno de la persona.
- Archivar una página de producto como marca o una portada como producto. Si no queda claro, se pregunta en una línea con el dominio dentro.
- Inventar argumentos de venta al corregir un producto con `ads_studio_update_product`: van las palabras de la persona.
- Reusar la misma llave para una tanda distinta.
