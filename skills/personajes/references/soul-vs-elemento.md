# Soul o Elemento: la decisión que define tu avatar

Higgsfield tiene dos formas de guardar una identidad reutilizable. No son intercambiables y elegir mal se descubre tarde, cuando ya entrenaste.

## La tabla

| | **Soul** (`show_characters`) | **Elemento** (`manage_reference_elements`, `show_reference_elements`) |
|---|---|---|
| Qué es | Un modelo entrenado con la cara de una persona | Una imagen de referencia guardada con nombre |
| Qué necesita | 5 a 20 fotos de la **misma** persona | Una imagen basta |
| Cuánto tarda | Unos 10 minutos. No bloquea, se consulta el estado | Al momento |
| Cuántos sujetos por escena | **Uno solo**, y no se negocia | Varios en la misma imagen |
| Sirve para | Personas | Personas, objetos, lugares, props |
| Fidelidad | Más alta: aprendió esa cara | Buena, pero es parecido, no identidad entrenada |
| Con qué modelos | **Solo** `soul_2` y `soul_cinematic` | Imagen y video; la lista está abajo |
| Se usa así | `soul_id` en la llamada de generación | `<<<element_id>>>` metido dentro del texto del prompt |

## Cómo se decide en dos preguntas

**¿Es la cara de una persona concreta, sola en el cuadro, y tienes 5 o más fotos suyas?**
Sí a todo, es **Soul**. Es el gemelo digital: te va a salir esa persona, no alguien parecido.

**¿Cualquier otra cosa?**
Es **Elemento**. Y en particular es Elemento, sin discutir, si:
- Hay más de una persona en la escena. Soul no puede.
- El sujeto no es una persona: tu botella, tu empaque, tu local.
- Solo tienes una imagen.
- Quieres el resultado ahora.
- Vas a usar un modelo que no sea `soul_2` ni `soul_cinematic`.

## Lo que se rompe si eliges mal

- Entrenas un Soul y luego lo quieres usar con `gpt_image_2_6`: no se puede, y ya pagaste el entrenamiento.
- Quieres a tu avatar dándole la mano a un cliente en la misma foto: con Soul no se puede, hay que rehacerlo como Elementos.
- Guardas al personaje como Elemento y esperas fidelidad de gemelo digital: te va a dar un aire, no la cara.

## Cómo se suben las imágenes

Igual en los dos casos, y en ninguno se piden por chat:

1. Archivo que puedes leer: la subida de `estudio` (`media_upload`, PUT, `media_confirm`).
2. Adjunto del chat que no puedes leer: `media_upload_widget`, como única herramienta del turno. El servidor no lee adjuntos del anfitrión y pedirlos quema un turno.
3. `media_import_url` para una imagen que ya vive en una URL https. Devuelve el identificador que se pasa después.
4. También sirve el identificador de un trabajo de imagen que ya generaste antes.

Rutas locales, nunca. Solo identificadores confirmados.

**Y ojo con la diferencia entre las dos rutas**, que es donde se cae la llamada: Soul acepta el identificador pelado dentro de `images[]` (o una URL https); Elemento pide cada media como `{ id, url }`, con los **dos** campos obligatorios — el id y la URL https que devolvió la subida (más un `type` opcional, `media_input` o `image_job`). Con el id solo, la creación del Elemento falla. Guarda las dos cosas en cuanto subas.

## Las fotos que dan un buen Soul

Si son de una persona real, pídelas así:
- Entre 8 y 15, mejor que 5.
- Luz distinta en varias: día, interior, sombra.
- Ángulos distintos: de frente, de tres cuartos, de perfil.
- Expresiones distintas, con y sin sonrisa.
- Sin lentes de sol, sin filtros de belleza, sin nadie más en el cuadro.
- Nada de fotos ya generadas por IA **cuando el avatar es una persona real**: entrenar sobre generado degrada el parecido. Para un personaje inventado es al revés, y la hoja de personaje generada es la fuente correcta, porque no hay ninguna cara real que respetar.

Un juego de 12 fotos variadas da un avatar notablemente mejor que 20 selfies iguales del mismo día.

## Con qué modelos funciona un Elemento

Lista del servidor (noviembre 2026). Si vas a usar otro modelo, comprueba antes que acepte elementos de referencia.

| Tipo | Modelos |
|---|---|
| Imagen | `gpt_image_2_6`, `gpt_image_2_6_flare`, `nano_banana_pro`, `nano_banana_2`, `gpt_image_2`, `seedream_v4_5`, `seedream_v5_lite`, `cinematic_studio_2_5` |
| Video | `cinematic_studio_video_v2`, `cinematic_studio_3_0`, `seedance_2_0`, `kling3_0` |

Tres letras pequeñas:

- `kling3_0` solo respeta el elemento si además va un `start_image` en `params.medias`. Sin fotograma inicial, pide uno o cambia de modelo de video.
- `gpt_image_2_6` acepta elementos para imagen normal y GIF. En salida SVG no acepta ni elementos ni imágenes de referencia.
- `seedance_2_5`, que es el modelo de video por defecto del plugin, **no** aparece en esa lista. Para video con Elemento, elige uno de los cuatro de arriba.

## Los estilos de Soul

`soul_2` acepta además un `style_id`: un estilo curado que se elige en `get_presets` con `source: "soul"`. Se combina con `soul_id`, pero no con una imagen de referencia. Elegir un estilo ahí no genera nada y no se ejecuta con `execute_preset`: el id va a `generate_image`.

`soul_2` y `soul_cinematic` aceptan `quality` `1.5k` o `2k` y como mucho una imagen en `medias`.
