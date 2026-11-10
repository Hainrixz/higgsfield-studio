# Modelos de imagen, parámetros y recetas

Leído del catálogo en vivo (noviembre 2026). El catálogo cambia: ante la duda, `models_explore` con `action: "get"` y el `model_id`. No es la lista completa; es lo que conviene conocer.

## Los que más se usan

| Modelo | Para qué | Parámetros propios | Rol de `medias` |
|---|---|---|---|
| `gpt_image_2_6` | General, texto dentro, edición, GIF, SVG. El que recomienda el servidor por defecto | `quality` (`auto`, `low`, `medium`, `high`, `xhigh`, `max`; por defecto `low`), `resolution` (`1k`, `2k`, `4k`; por defecto `1k`), `background` (`auto`, `opaque`, `transparent`), `output_format` (`png`, `jpeg`, `webp`, `gif`, `svg`), `size`, `frame_count`, `frame_duration_ms` | `image_references` |
| `gpt_image_2_6_flare` | Variante Flare del anterior, mismos parámetros | Igual | `image_references` |
| `nano_banana_pro` | Máxima calidad, texto y diagramas | `resolution` (`1k`, `2k`, `4k`; por defecto `2k`) | `image_references` |
| `nano_banana_2` | Rápido y bueno; edición con máscara | `resolution` (por defecto `1k`), `is_inpaint` | `image_references`, `mask` |
| `seedream_5_5` | Edición por instrucción, PNG siempre, fondo transparente | `resolution` (`1k`, `1.5k`, `2k`), `background` | `image_references` |
| `seedream_v4_5` | Transformaciones con control, hasta 4K | `quality` (`basic`, `high`) | `image_references` |
| `soul_2` | Retrato, moda, look de creador | `quality` (`1.5k`, `2k`), `style_id`, `soul_id` | `image` (máximo 1) |
| `soul_cinematic` | Fotograma de cine, concept art | `quality`, `soul_id` | `image` (máximo 1) |
| `recraft_v4_1` | Logos, iconos, ilustración, mockups limpios | `model_type` (`standard`, `vector`, `utility`, `utility_vector`), `colors` (hasta 10 en `#RRGGBB`), `background_color`, `resolution` (`1k`, `2k`) | No admite referencias |
| `recraft_v4_styles` | Generar con un estilo guardado de la persona | `style_id` (obligatorio), `style_match` (`precise`, `flexible`), `resolution` | No admite referencias |
| `ideogram_4_5` | Tipografía y composición con texto | `resolution`, `quality`, `magic_prompt`, `seed` | `image_references`, `mask` |
| `ideogram_vector` | SVG desde texto o vectorizar una imagen | `operation` (`generate` o `vectorize`, obligatorio), `quality`, `mode` | `image_references` |
| `flux_3_image` | Edición con hasta diez referencias, hasta 4K | `resolution` (`768sq` a `4k`) | `image_references` |
| `z_image` | Borrador estilizado muy rápido | Ninguno | No admite referencias |
| `image_auto` | Que Higgsfield elija el modelo según el prompt | Ninguno | `image` |

Los de producto y anuncios (`marketing_studio_image` y familia) los explican `producto` y `anuncios`. `soul_cast` y el entrenamiento de un Soul, `personajes`.

Varios modelos aceptan generaciones ilimitadas del plan (el catálogo los marca con `supports_unlim`). Eso no cambia nada aquí: `use_unlim` solo se manda si la persona lo pide, como dice `estudio`.

## Proporciones

Casi todos tienen `1:1`, `16:9`, `9:16`, `4:3`, `3:4`, `3:2` y `2:3`. Diferencias que muerden:

- `4:5` (el vertical de feed de Instagram): lo tienen los GPT Image, Nano Banana, `recraft_v4_1`, `flux_3_image`. **No** lo tienen `soul_2` ni los Seedream: usa `3:4` y dilo.
- `soul_cast` solo sale en `16:9`.
- Varios aceptan `auto` (la proporción la decide la referencia).
- `21:9` existe en los GPT Image, Nano Banana y Seedream.

## Recetas

### Texto a imagen

```json
{ "params": {
  "model": "gpt_image_2_6",
  "prompt": "<english prompt>",
  "aspect_ratio": "4:5",
  "quality": "high",
  "resolution": "2k"
} }
```

### Editar con una foto de referencia

Sube la foto (lo explica `estudio`) y pásala en `medias`. El prompt dice el cambio y lo que no se toca.

```json
{ "params": {
  "model": "gpt_image_2_6",
  "prompt": "Replace only the background with a sunlit concrete wall. Keep the person, pose, clothing and lighting on the subject exactly unchanged.",
  "medias": [ { "value": "<media_id o job_id>", "role": "image_references" } ]
} }
```

Con varias referencias, numéralas al inicio del prompt: `IMAGE REFERENCES: image 1 = the product; image 2 = the logo.` Para encadenar retoques, pasa el `job_id` del resultado anterior como `value`.

### Texto dentro de la imagen

```
Poster, 4:5. Bold sans-serif headline reading exactly "Abrimos el lunes" in the upper third,
white on deep green. No other text, no watermark.
```

Pocas palabras, exactas, entre comillas y con su sitio en el cuadro. Revisa letra por letra al recibir; si falla, reintenta una vez o entrega la imagen limpia.

### GIF

```json
{ "params": {
  "model": "gpt_image_2_6",
  "prompt": "<english prompt describing a short looping animation>",
  "output_format": "gif",
  "size": "480x480",
  "frame_count": 16,
  "frame_duration_ms": 120
} }
```

`size` con los dos lados divisibles entre 16. Más fotogramas y más tamaño cuestan más: mira el precio con `get_cost`.

### SVG

```json
{ "params": {
  "model": "gpt_image_2_6",
  "prompt": "<english prompt: flat vector icon…>",
  "output_format": "svg"
} }
```

Sin `medias`. Para un logo vectorial de marca, el flujo `brand-asset-creation` usa `recraft_v4_1` con `model_type: "vector"`.

### Tanda

```json
{ "requests": [
  { "index": 1, "params": { "model": "gpt_image_2_6", "prompt": "<slide 1>", "aspect_ratio": "4:5" } },
  { "index": 2, "params": { "model": "gpt_image_2_6", "prompt": "<slide 2>", "aspect_ratio": "4:5" } }
] }
```

Para que una serie se vea de la misma familia, repite palabra por palabra los bloques de luz, paleta y estilo en todos los prompts y cambia solo el sujeto y la composición.

## Lo que no se pudo comprobar

- `batch_size` aparece en varios modelos (número de salidas por trabajo). Cómo se cobra y cómo se muestra frente a `count` no está verificado: usa `count` salvo que un flujo del servidor diga otra cosa.
