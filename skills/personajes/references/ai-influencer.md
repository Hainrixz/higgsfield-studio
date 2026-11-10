# AI Influencer: rasgos, cotización y generación

Leído de los esquemas y de las instrucciones del servidor (noviembre 2026). Una hoja de AI Influencer es una imagen de personaje (retrato más cuerpo entero). No entrena un Soul y no genera video.

## Las herramientas

| Herramienta | Qué hace | Gasta |
|---|---|---|
| `ai_influencer_get_options` | Lista los grupos de rasgos y en qué `tier` vale cada opción. Acepta `tier` para filtrar | No |
| `ai_influencer_list_presets` | Personajes de ejemplo con vista previa y sus ajustes en `recreate.params`. Acepta `size`, `cursor`, `preset_id` | No |
| `ai_influencer_get_settings` | Lee los ajustes de una hoja existente por su `job_id` | No |
| `ai_influencer_prepare` | Arma el diseño y cotiza. Devuelve `params`, créditos y, si se sabe, `free_gens_remaining` | No |
| `ai_influencer_generate` | Genera de 1 a 4 hojas con los `params` de la preparación | **Sí** |
| `build_ai_influencer` | La versión todo en uno del mismo backend (acciones de opciones, ejemplos, recrear, cotizar y enviar) | Solo al enviar |

Las instrucciones del servidor piden el camino `ai_influencer_prepare` y luego `ai_influencer_generate`. Usa `build_ai_influencer` solo si las otras no están disponibles en ese conector.

## Los `tier`

Humanos: `normal`, `freak`, `total`. Animales: `insects`, `frogs`, `cats`, `dogs`, `capybaras`, `birds`.

Con `randomize: false` y sin `tier`, el servidor usa `freak` (lo llama "Bold"). Si quieren alguien de aspecto corriente, pasa `tier: "normal"` de forma explícita.

## Los rasgos

`selection` es un objeto `{ grupo: [ids] }`. Los ids y el máximo por grupo salen de `ai_influencer_get_options`; no los escribas de memoria. Como orientación, los grupos que devolvía en noviembre 2026:

| Grupo | Máximo | Para |
|---|---|---|
| `gender`, `body_type`, `height`, `age`, `ethnicity_origin_base`, `skin_tone` | 1 cada uno | Identidad y cuerpo |
| `hair`, `hair_colour`, `facial_hair` | 1 cada uno | Pelo |
| `eye_shape`, `eye_color`, `freak_head`, `freak_neck` | 1 cada uno | Cara |
| `aesthetic` | 1 | Estilo de ropa (casual, sporty, streetstyle, y2k, retro, goth, theatrical, suits) |
| `proportions`, `distinctive` | 2 cada uno | Proporciones y rasgos distintivos |
| `accessory` | 3 | Accesorios |
| `freak_face` | 4 | Rasgos faciales |

Edad, etnia, tono de piel y rasgos de cara solo existen en los `tier` humanos.

## Preparar

Campos de `ai_influencer_prepare`:

- `tier`, `selection`, `brief` (texto libre, hasta 4000 caracteres), `seed` (1 a 1 000 000).
- `batch_size`: 1 a 4 hojas. Por defecto 1.
- `medias`: como mucho **una** imagen de identidad confirmada.
- `item_medias`: hasta **tres** referencias de estilo.
- `randomize`: `true` por defecto, rellena lo que no especificaste con las reglas de azar del constructor. `false` conserva solo lo explícito.
- `body_color`, `animal_variant`, `trait_variants`: vienen de ajustes guardados; se pasan tal cual.

Con una imagen de identidad, los rasgos de identidad quedan sin fijar salvo que los elijas.

Para repetir un ejemplo o una hoja existente: toma sus `params` (de `ai_influencer_list_presets` o `ai_influencer_get_settings`), pásalos a `ai_influencer_prepare` con `randomize: false` y conserva referencias y `seed`.

Repetir la preparación con azar puede dar otro diseño. Prepara una vez.

## Generar

`ai_influencer_generate` recibe `params` (los de la preparación, **sin cambios**) y `max_credits` (obligatorio). El servidor vuelve a comprobar el precio y rechaza si supera `max_credits`.

| Caso | Qué pasas |
|---|---|
| Pidieron crear el personaje | `max_credits` igual a la cotización. La petición de crear ya permite seguir dentro del presupuesto |
| Dieron un tope menor | `max_credits` igual a ese tope. Si no alcanza, se dice |
| Solo querían ver el diseño o el precio | No se llama. Se termina en la preparación |
| Pidieron expresamente usar generaciones gratis | `use_free_gens: true` con `max_credits: 0`, y solo si `free_gens_remaining` se conoce y es mayor que cero. Nunca se pasa a créditos por tu cuenta. Una generación gratis siempre es una sola hoja |
| Variantes | Se prepara cada hoja y se respeta el total y el presupuesto agregado |

Devuelve `job_id` (el primero) y `job_ids` (la tanda) antes de que terminen. Espera todos con `jobs_wait`, `timeout_seconds` de 15 como máximo.

- El visor se abre y se actualiza solo. No llames a `show_generation_by_ids` ni a `job_display` salvo que la persona pida verlo aparte.
- **Nunca reintentes un envío dudoso.** Repetir crea otra hoja y cobra otra vez. Si hubo timeout, mira `show_generations` antes.
- Gasta créditos que ya existen; no compra créditos ni suscripciones.

## Después: Genjutsu

Al terminar, se ofrece animar el personaje, salvo que ya dijeran que no. Hace falta que acepten y, con varias hojas, que elijan cuál exactamente. Entonces:

```
get_presets({
  source: "genjutsu",
  category: "genjutsu",
  initial_inputs: { character_sheet: [{ id: "<job_id de la hoja>", type: "image_job" }] }
})
```

`character_sheet` es siempre una lista de un elemento, nunca un objeto suelto. Se abre la galería de movimientos con el personaje ya puesto; ahí la persona elige el movimiento, ve ajustes y precio, y pulsa generar. No llames a `generate_video` ni a `execute_preset` después de abrirla. Lo demás de Genjutsu está en `animar` y `presets`.

## Si no está disponible

Si las herramientas de AI Influencer no responden en ese conector, se dice. No se sustituye en silencio por una imagen genérica.
