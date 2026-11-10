# Movimiento: qué ruta tomar y cómo describirlo

## La tabla de decisión

| Lo que te piden | Ruta | Cómo se arma |
|---|---|---|
| "Anima esta foto", "que la cámara se acerque", "que se mueva un poco" | `generate_video` con la imagen de arranque | La imagen va en `medias` con rol `start_image`; el prompt describe **solo** el movimiento |
| "Que empiece en esta foto y termine en esta otra" | `generate_video` con dos fotogramas | `start_image` + `end_image`, en un modelo que acepte los dos |
| "Que se mueva igual que este video", "cópiale el baile", "el mismo movimiento de cámara" | `generate_video` con `model: "hf_mult_motion_control"` (Genjutsu) | Las imágenes de referencia con rol `image` y **exactamente un** video guía con rol `video` |
| "Cambia el producto de este video por el mío" | `generate_video` con `model: "hf_mult_replace_object"` (Genjutsu) | Igual: imágenes de referencia más un solo video de origen |
| "Quiero un movimiento con estilo, no sé describirlo" | `get_presets` con `source: "genjutsu"` | Abre la galería de movimientos; la persona elige y genera desde el propio visor. Lo demás de plantillas lo lleva `presets` |
| "Que esta foto hable con este audio" | `generate_video` con `model: "intone"` | Foto del personaje + grabaciones de voz; detalle en el `SKILL.md` de `animar` |
| "Ponlo vertical", "que llene la pantalla del teléfono" | `reframe` | Un video, un `aspect_ratio` destino |
| "Súbelo de calidad", "que se vea nítido" | `upscale_video` | Lo lleva `editar` |
| Un solo personaje que siga un clip, y Genjutsu no sirvió | `motion_control` | `image_id` + `motion_video_id`. Es el recast antiguo de Kling: solo como plan B, nunca como primera ruta |

## Cómo se escribe un prompt de movimiento

La escena ya está en la imagen. Si la vuelves a describir, el modelo la reinterpreta y pierdes el encuadre que te costó conseguir. En el prompt van tres cosas y en este orden:

**1. La cámara.** Qué hace el punto de vista:

- Acercamiento lento (*slow push in*) — el que mejor funciona casi siempre.
- Alejamiento que revela (*pull back*) — para descubrir el contexto.
- Órbita alrededor del sujeto — muy vistoso, muy propenso a deformar.
- Paneo lateral — para recorrer algo largo.
- Cámara fija — sí, es una opción, y a veces la mejor.

**2. El sujeto.** Qué hace lo que está en el cuadro. Un gesto, uno solo: gira la cabeza, levanta el producto, parpadea, camina hacia la cámara.

**3. El ambiente.** Lo que se mueve por su cuenta: el vapor que sube, el humo, el polvo en el rayo de luz, la tela que ondea, el líquido que se mueve en el vaso.

Ejemplo de lo que sí:

> Acercamiento muy lento hacia el frasco. El vapor del café sube y se disuelve al salir del cuadro. La luz de la ventana no cambia. Todo lo demás, quieto.

Ejemplo de lo que no:

> Un frasco de café de especialidad sobre una mesa de madera, con luz de mañana, en una cocina moderna, mientras la cámara se acerca.

El segundo vuelve a describir la escena y el modelo se siente autorizado a rehacerla. El primero solo pide movimiento.

## La regla que más resultados salva: menos es más

Un acercamiento lento y limpio se ve caro. Tres cosas moviéndose a la vez se ve generado por IA, y se ve a un metro de distancia.

Cuando dudes: **una cosa de la cámara, una cosa del sujeto, nada más**. Si el resultado se siente muerto, siempre puedes pedir más en la siguiente. Al revés no funciona.

## Duración

La duración es el parámetro que más mueve el precio, así que se decide antes, no después:

| Para qué | Cuánto |
|---|---|
| Un plano de producto en un carrusel o en un anuncio | 3 a 5 s |
| Un gancho de Reel | 5 s |
| Un plano suelto dentro de un montaje más largo | 5 s |
| Una escena que tiene que contar algo | 8 a 10 s |

Casi nadie necesita diez segundos de un solo plano. Si no te dijeron duración, usa esta tabla según el destino y dilo al entregar. Cada modelo tiene su rango (míralo con `models_explore`); si pides una duración que no admite, el servidor la ajusta a la más cercana y lo avisa en `adjustments`.

## Formato: pídelo con el destino claro

Genera directo en la proporción final cuando puedas. Si el modelo tiene `aspect_ratio`, pásalo explícito: varios modelos, incluido Marketing Studio, salen en horizontal por defecto, y un video horizontal que va a Reels ya nació con un problema.

`reframe` es el arreglo cuando el video ya existe: rellena los bordes en vez de recortar, así que no te come el sujeto. Acepta `16:9`, `9:16`, `4:3`, `3:4`, `1:1` y `21:9`; por encima de 15 segundos hay que mandarle `duration_seconds` y `resolution`, y el máximo son 60 segundos.

Qué proporción pide cada red lo resuelve la skill `publicar`, que es donde vive esa tabla. No la copies aquí.

## Los tres fallos que se repiten

**1. El producto se deforma a media toma.** El modelo "recuerda" mal la forma cuando algo se mueve mucho. Se arregla bajando el movimiento y volviendo a anclar el producto en el prompt: "el frasco no cambia de forma ni de etiqueta en ningún momento". Se descarta la toma mala, no se entrega.

**2. Manos y caras.** Mira los dedos y mira los ojos. Si hay un dedo de más o la mirada se va a ninguna parte, no se entrega: se nota más en video que en foto, porque el ojo tiene medio segundo para descubrirlo.

**3. El movimiento de péndulo.** Va y regresa al punto de partida, y se ve falso. Pasa cuando el prompt pide un movimiento sin dirección clara. Se arregla diciendo hacia dónde y que no vuelva: "la cámara se acerca de forma continua, sin regresar".

Ninguno de los tres se arregla generando otra vez lo mismo y cruzando los dedos. Cambia el prompt, di en una línea qué cambiaste y reintenta una vez. Si vuelve a fallar, para y explica: eso ya lo marca `estudio`.

## El prompt va en inglés

Todo lo de arriba se piensa en el idioma que quieras, pero el prompt que mandas a Higgsfield va en inglés. El ejemplo bueno de antes, ya listo para enviar:

> Very slow push in toward the jar. Steam from the coffee rises and dissolves as it leaves the frame. The window light does not change. Everything else stays still.
