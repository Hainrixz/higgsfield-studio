---
name: anuncios
description: Anuncios con Higgsfield de principio a fin. Creativos estáticos con copy en Ads Studio (marca, producto, cotización, generación), video de anuncio con Marketing Studio, micro-dramas publicitarios, multiplicar un anuncio que ya tienes y sacar la estructura de un anuncio de la competencia sin copiar su contenido. Úsala si dices "hazme anuncios de mi producto", "creativos para Meta", "anuncios para Instagram", "analiza mi web y saca anuncios", "un video de anuncio", "un micro-drama de mi producto", "multiplica mi anuncio", "hazme 10 versiones de este anuncio", "recrea mi anuncio para otro país" o "clona la estructura de este anuncio". EN: ad creatives with Ads Studio, ad videos, micro-drama ads, Ad Multiplier, competitor ad structure.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Anuncios: del producto al creativo

Carga antes la skill `estudio`. Aquí va lo propio de los anuncios: cuál de las cinco rutas del servidor toca, el orden exacto de Ads Studio y la única parada de precio que es obligatoria porque la impone el servidor.

## Cuándo se activa

Cuando la palabra es **anuncio, creativo, campaña o pauta**. Una foto de producto sin copy es `producto`. Una persona recomendando a cámara es `ugc`.

## Qué ruta usar

| Te piden | Ruta | Primer paso |
|---|---|---|
| Creativos estáticos con titular, texto y botón (Meta, Instagram, Facebook) | Ads Studio | `get_workflow_instructions` con `{ workflow: "ads-studio" }` |
| Un video de anuncio de producto, 12 a 15 s | `generate_video` con `marketing_studio_video` | `models_explore` `action: "get"` |
| Una historia corta con personajes que actúan y hablan | Micro-drama | `get_preset_instructions` con `{ preset: "/drama-ads" }` |
| Versiones de **un video suyo** de 4 a 30 s: otra gente, otro producto, otro país, otro gancho | Ad Multiplier | `get_workflow_instructions` con `{ workflow: "ad-multiplier" }` |
| "Hazlo como este anuncio de la competencia" | Analizar y quedarte con el esqueleto | `video_analysis_create` |

Si `ads_studio_list_brands` no está entre las herramientas, Ads Studio no está activo en ese conector: dilo, da `https://higgsfield.ai/ads-studio` y para. No lo sustituyas por imágenes sueltas.

## Ads Studio, en orden

Carga el workflow `ads-studio` antes de la primera llamada `ads_studio_*`. El detalle campo por campo está en `references/ads-studio.md`.

1. **Marca o producto.**
   - Hablan de una marca que quizá ya tienen: `ads_studio_list_brands` y reutiliza la que esté `done`.
   - Marca nueva: `ads_studio_create_brand` con la URL de la web en `input`. Con solo el nombre no arranca nada y devuelve `needs_confirmation` con `suggested_website`: confirma el dominio en una línea y vuelve a llamar con la URL. Nunca investigues un dominio que nadie nombró.
   - Producto suelto: `ads_studio_add_product` con `url` (su página), `text` (lo que te dijeron) e `images` (enlaces https públicos). Con `brand_id` queda bajo esa marca; sin él, sin marca. No listes marcas antes si pidieron un producto.
   - Un dominio o la portada es marca. Un enlace a un artículo concreto es producto. Ads Studio no lo comprueba por ti.
2. **Espera a que lo lea.** La marca tarda alrededor de minuto y medio; el producto, cerca de un minuto. Di qué arrancó y **cierra el turno**. El servidor prohíbe consultar en bucle: lees `ads_studio_get_brand` o `ads_studio_get_product` **una vez** cuando la persona vuelva.
3. **Listo significa:** producto en `status: completed` (y `images_count` mayor que cero si vino de una página), productos de la marca con `texts_ready: true`, marca en `status: done`. Antes de eso no se cotiza ni se genera: saldrían genéricos.
4. **Cotiza:** `ads_studio_quote` con **exactamente** los argumentos que irán a generar. Pedir anuncios ya autoriza cotizar; no preguntes si puedes.
5. **Parada del servidor.** Di los créditos y cuántos creativos compran, y espera un **sí explícito a ese precio**. No es una regla de este plugin: lo exigen el workflow de Ads Studio y la descripción de `ads_studio_generate`, y el servidor vuelve a cotizar antes de cobrar. Si solo preguntaron el precio, terminas en la cotización.
6. **Genera:** `ads_studio_generate` una sola vez, con los mismos argumentos y un `idempotency_key` que eliges una vez (por ejemplo `ads-<marca>-<AAAAMMDD>-01`). Si reintentas, **la misma llave**: una nueva compra la tanda dos veces.
7. **Informa y para.** La respuesta trae `runs` con su `run_id`. Di para qué productos son. La tarjeta muestra las imágenes; no hay enlace que pedir.
8. **Seguimiento:** `ads_studio_get_run` cuando pregunten. Un run puede estar `done` con `still_rendering: true`: no digas "listo" hasta que sea `false`. El render tarda unos tres minutos.

Argumentos que siempre revisas: `aspect_ratio` (`1:1`, `9:16`, `16:9`, `3:4`; **no existe `4:5`**, ofrece `3:4`), `total` (número total de conceptos, al menos uno por sujeto) y `objective` solo si la meta quedó clara.

## Video de anuncio

`marketing_studio_video` dura entre 12 y 15 s y por defecto sale horizontal: pasa `aspect_ratio: "9:16"` si es para Reels o TikTok. La foto del producto va en `medias` con rol `image` (o `start_image`). Los detalles y sus límites en este conector están en `references/video.md`. Para una plantilla de video o UGC del catálogo, abre `show_marketing_studio_v2`.

## Micro-drama

- `/drama-ads` a secas: `ads_studio_story_presets` y una línea ("elige una tarjeta o cuéntame la historia"). Para ahí. Mirar el catálogo nunca arranca una película.
- Con historia o tarjeta elegida: `get_workflow_instructions` con `{ workflow: "drama-ads" }` y se sigue al pie. Lee la tarjeta con `ads_studio_story_recipe`, reparto con `ads_studio_list_avatars`, cada etapa se muestra con `ads_studio_story_stage`.
- Tiene dos modos: preguntar antes de cada etapa pagada o correr de un tirón. Lo elige la persona; es la pregunta de entrada del propio workflow. Resumen en `references/video.md`.
- Nunca `ads_studio_generate` para un micro-drama.

## Ad Multiplier

Parte de **un** video de 4 a 30 s. Tres modos: editar (cambia personas, producto, ropa o fondo y conserva movimiento y audio), recrear (vuelve a filmar el mismo anuncio para otro mercado, idioma o elenco) y solo gancho o cierre. El workflow manda: un envío a la vez con `generate_video`, sin batch y sin otra herramienta de mostrar. Resumen en `references/video.md`.

## Clonar la estructura de un anuncio

1. Consigue el video: archivo subido (su `media_id`) o enlace de YouTube.
2. `video_analysis_create` con `video_input_id` o `youtube_url`. Avisa que cuanto más largo el video, menos preciso el análisis.
3. `video_analysis_status` cada 30 a 60 s hasta `completed`. Tarda de 3 a 5 minutos.
4. Llena la ficha de `references/anatomia.md`: tiempos, tipo de gancho, orden de argumentos, cierre.
5. Escribe el guion propio sobre ese esqueleto y prodúcelo por la ruta que toque.

**Se toma la forma, nunca el contenido:** ni sus frases, ni su creador, ni su música, ni su promesa. Recrear plano por plano el video de otra marca no es "clonar estructura": Ad Multiplier es para los videos de la persona.

## Errores comunes

- Mandar foto de producto más "hazme anuncios" a `generate_image`. Con copy, es Ads Studio.
- Cotizar o generar con el producto en `queued` o `in_progress`.
- Pasar un `run_id` o `concept_id` a `jobs_wait`, `show_generation_by_ids` o `job_display`.
- Mandar `4:5`, o un `objective` que nadie insinuó.
- Bajar la cantidad o cambiar de producto por tu cuenta cuando faltan créditos. Se dicen los números y decide la persona.
- Tras un `ADS_STUDIO_UNAVAILABLE` al generar, reintentar con llave nueva. Primero `ads_studio_list_runs`.
- Prometer ediciones o variaciones de un creativo: por estas herramientas no se puede; eso vive en la web de Ads Studio.

## A dónde seguir

| Quieren | Skill |
|---|---|
| Fotos de producto sin copy | `producto` |
| Persona hablando a cámara | `ugc` |
| Presentador fijo para toda la campaña | `personajes` |
| Doblar el anuncio a otro idioma | `audio` |
| Recortar, subtitular, cambiar proporción | `editar` |
| Predecir cómo va a rendir | `analizar` |
| Publicarlo en TikTok | `publicar` |
