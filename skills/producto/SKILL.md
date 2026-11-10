---
name: producto
description: Fotos de producto a partir de la foto real del producto, sin inventarle el empaque. Packshot limpio, lifestyle, en la mano, macro, banner, carrusel, pin, modelo virtual, y las plantillas de Marketing Studio (product-shot y motion). Úsala si dices "hazme fotos de mi producto", "un packshot", "fotos para mi tienda", "fotos para Shopify", "pon mi producto en una cocina", "un carrusel de mi producto", "un hero shot", "abre Marketing Studio" o "plantillas de producto". EN: product photography from the real product photo (packshots, lifestyle, carousels, Marketing Studio templates).
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Producto: fotos que siguen siendo tu producto

Carga antes la skill `estudio`: conexión, subida de archivos, costo, espera y entrega salen de ahí. Aquí solo va lo propio de la foto de producto: qué ruta del servidor usar, en qué orden se llama y cómo se comprueba que lo generado sigue siendo ese producto y no uno parecido.

## Cuándo se activa

- Hay un producto físico y piden imágenes fijas de él: catálogo, tienda, redes, banner, carrusel.
- Piden una plantilla de producto o abrir Marketing Studio.
- **No** es esta skill si dicen "anuncio", "creativo" o "campaña" con texto de venta (eso es `anuncios`, que usa Ads Studio), ni si piden video con una persona hablando (`ugc`), ni una miniatura de YouTube (`imagen`).

## Qué ruta usar

| Te piden | Ruta | Modelo |
|---|---|---|
| Sesión de fotos, varias tomas, carrusel, banner, pin, modelo virtual, restyle | Workflow `product-photoshoot` | `nano_banana_pro`, fijado por el workflow |
| Una toma con nombre de receta: `/hero-shot`, `/in-hand`, `/flatlay`, `/minimalist-white`… | `get_preset_instructions` con ese comando | El que traiga la receta |
| Una sola imagen comercial rápida, sin sesión | `generate_image` con `marketing_studio_image` | — |
| Ver y elegir plantillas de producto | `get_presets` con `source: "marketing_studio"`, `category: "product-shot"` | — |
| Plantillas de movimiento para el producto (giro, barrido de luz) | `get_presets` con `source: "marketing_studio"`, `category: "motion"` | — |
| "Abre Marketing Studio", pósters, marketplace | `show_marketing_studio_v2` | El widget lo hace todo |

En la duda entre las dos primeras: si piden **más de una imagen** o un formato (carrusel, banner), workflow. Si piden **una** y encaja con una receta, receta.

## Procedimiento: sesión con el workflow

1. **Sube la foto real** como dice `estudio` y quédate con el `media_id`. El workflow acepta también producto solo descrito con texto, pero `restyle`, modelo virtual y primer plano con persona exigen imagen: no la inventes.
2. `get_workflow_instructions` con `{ workflow: "product-photoshoot" }`. Ese documento manda. Elige **un** modo según lo que se va a entregar (tabla en `references/rutas.md`).
3. Carga con `get_workflow_bundle_file` solo lo del modo elegido: `references/<modo>.md`, más `typography.md`, `photography-vocabulary.md`, `photographer-references.md`, `negative-prompts.md` y `refinement-pass.md`. No cargues los diez modos.
4. `models_explore` con `action: "get"`, `model_id: "nano_banana_pro"`, una vez, para confirmar referencia de imagen y 2K. Si no los soporta, para y dilo: el workflow prohíbe cambiar de modelo o soltar la referencia.
5. Arma los prompts en inglés con la plantilla del modo. Los textos que la persona quiere en la imagen se respetan tal cual, en su idioma. Nombres de fotógrafos, revistas o marcas ajenas no entran al prompt: son guía interna.
6. Lanza con `generate_image_batch`. Cada pieza es `{ index, params }` con `model: "nano_banana_pro"`, `resolution: "2k"`, `count: 1`, su `aspect_ratio`, y la foto en `medias` con `role: "image_references"`. El prompt termina con la línea literal `resolution: 2k`. Grupos de 6 como máximo por envío.
7. Espera con `jobs_wait` (grupos de 8). Reintenta solo el índice que falló, nunca la tanda.
8. **Revisa contra la foto real** (lista en `references/recetas.md`). Un defecto visto o un cambio pedido se corrige en ese mismo índice, con su último resultado como única referencia. Máximo dos refinamientos y tres envíos por índice.
9. **Un solo** `show_generation_by_ids` con el resultado final de cada índice, en orden. Sin primeras pasadas ni intentos descartados.

Lo que falte lo resuelve el propio workflow sin preguntar: 3 variantes, `1:1`, estudio limpio, colores del producto. Lo dices en una frase y sigues. Solo se pregunta lo que de verdad impide generar (no hay foto ni descripción usable).

## Procedimiento: una receta con nombre

1. `get_preset_instructions` con `{ preset: "/hero-shot" }` (o la que toque). Sin `preset` lista las recetas disponibles.
2. La respuesta trae los parámetros de generación y un prompt maestro. Llama a `generate_image` con esos parámetros, la foto como referencia y el prompt **sin tocar**.
3. Sin plan, sin opciones de prompt, sin confirmación extra: la receta ya lo decidió. El formato o la cantidad que pida la persona sí mandan sobre los valores por defecto.

## Procedimiento: plantillas de Marketing Studio

1. `get_presets` con `source: "marketing_studio"` y la categoría. Devuelve `items` con `id`, `name`, `type` y vista previa. Busca por nombre con `query`.
2. Cuando eligen una: `get_presets` **una vez** con `preset_id` e `initial_inputs` (el `media_id` de la foto en el campo que marque `execution.input_schema`). Eso abre la ficha prellenada.
3. Mirar plantillas no autoriza a generar: es regla del servidor. `execute_preset` solo si piden generar esa plantilla, y con `execution.readiness` en orden. El detalle está en la skill `presets`.

## Decisiones rápidas

| Situación | Qué haces |
|---|---|
| Varias vistas de un producto descrito solo con texto | Genera primero la imagen 0, espera, y úsala de referencia para las demás |
| Piden `4:5` | `nano_banana_pro` y `marketing_studio_image` lo admiten; en otros modelos va `3:4` |
| Quieren el producto recortado, más grande o en otra proporción | Pasa a `editar` |
| La etiqueta salió con letras cambiadas | Refinamiento de ese índice nombrando el texto exacto; no regeneres todo |
| Piden listado de Amazon con sus reglas | El workflow lo excluye: dilo y ofrece packshot normal |

## Errores comunes

- Mandar "foto de producto + anuncio" a `generate_image`. Si hay copy de venta, es Ads Studio.
- Usar `count` para variantes distintas. `count` repite el mismo prompt; composiciones distintas son piezas distintas del batch.
- Pasar la foto con `role: "image"` a `nano_banana_pro`. Su rol es `image_references`.
- Afirmar que la etiqueta quedó perfecta sin haber visto la imagen.
- Inventar ingredientes, precios o beneficios para rellenar un texto. Lo que no dijo la persona no va.
- Llamar a `execute_preset` porque la plantilla "ya está abierta".

## A dónde seguir

| Después quieren | Skill |
|---|---|
| Quitar fondo, ampliar, cambiar proporción | `editar` |
| Darle movimiento a la foto | `animar` |
| Anuncios con texto a partir de esas fotos | `anuncios` |
| Alguien mostrando el producto a cámara | `ugc` |
| Que el prompt tenga mejor luz y lente | `direccion-de-arte` |
| Modelo 3D del producto | `tres-d` |

Recetas de encuadre y luz: `references/recetas.md`. Modos del workflow, modelos de Marketing Studio y parámetros: `references/rutas.md`.
