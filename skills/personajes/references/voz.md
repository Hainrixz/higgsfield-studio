# La voz del avatar

Una cara consistente con una voz distinta cada vez sigue pareciendo tres marcas. La voz se fija igual que la cara.

## Crear la voz de la persona

`create_voice` abre el widget que hace todo el trabajo: graba desde el navegador o sube un archivo, lo confirma y crea la voz de punta a punta. Cuando el widget avisa que terminó, **ya está**: no hay que llamar a nada más.

- Si la persona prefiere subir un audio que ya tiene, se llama con `initial_tab: "upload"` y lo vuelve a elegir en el widget.
- Nunca le pidas que adjunte el audio en el chat. El servidor no puede leer adjuntos del anfitrión, y ese turno se pierde.
- Puedes prellenar el nombre con `name`, pero el widget lo pide igual.
- Si ya tienes un audio subido y confirmado (su `media_id`), no hace falta el widget: existe `create_voice_from_confirmed_audio`. Lee su esquema antes de usarla.

Un buen audio de origen: 30 segundos o más, en un cuarto callado, hablando normal y no leyendo como robot. Grabado con el teléfono cerca de la boca queda mejor que con un micro caro a dos metros.

## Usar una voz de la casa

Si nadie quiere prestar su voz, o hace falta una y ya, `list_voices` devuelve las voces de fábrica más las propias. Cada una viene con:

- `voice_id`, el identificador.
- `voice_type`, que es `preset` (de fábrica) o `element` (propia).
- `preview_url`, para escucharla antes.

**Se pasan los dos juntos, siempre.** Un `voice_id` sin su `voice_type` no selecciona nada.

Cuando haya varias candidatas, pásale los `preview_url` a la persona y que elija ella. Es su marca la que va a sonar así durante el próximo año.

## Dónde se usa después

- **Voz en off suelta:** `generate_audio`. El modelo por defecto es `seed_audio`, y acepta `voice_type` + `voice_id`. Trae afinado de velocidad, tono y volumen (`speech_rate`, `pitch_rate`, `loudness_rate`) si hace falta. Para varias líneas independientes (2 a 12), `generate_audio_batch`.
- **Videos hablados:** el workflow `ugc-video` saca la voz del propio clip de video y no admite una narración aparte ni imitar la voz de la persona de una foto. Ahí no la manejes por tu cuenta: sigue el documento del workflow. Si después quieren la voz fija de la marca sobre ese video, es `voice_change`.
- **Cambiar la voz de un video que ya existe:** `voice_change` con `video_id`, `voice_id` y `voice_type`. Conserva tiempos e imagen.
- **Doblar un video a otro idioma, con labios sincronizados:** `dubbing` con `video_id` y `target_language`. Acepta, entre otros, `spa`, `eng`, `por`, `fra`, `deu`, `ita` (18 idiomas en noviembre 2026; la lista completa está en su esquema). Útil para reciclar un reel que funcionó a otro mercado.

Ojo con estas tres: `voice_change`, `dubbing` y `create_voice` cuestan créditos y **ninguna admite consulta de precio**. No hay número que enseñar antes: se avisa en una línea, se hace, y se reporta el saldo de antes y el de después. `generate_audio` sí admite `get_cost`.

## La regla

Se clona la voz de quien la está prestando, en ese momento, sabiendo qué se va a hacer con ella. Punto.

No la de un cliente que mandó un audio de WhatsApp. No la de un socio que "seguro no le importa". No la de nadie famoso, ni "parecida a". Suplantar una voz es un problema legal en la mayoría de los países donde va a correr esto, y además se nota.

Si te lo piden igual, dilo de frente y ofrece lo que sí se puede: una voz de fábrica que suene parecida en tono y ritmo, elegida por la persona con las previsualizaciones delante.

## Guárdalo

Apunta el `voice_id` y su `voice_type` donde la persona guarde lo de su marca: si ya tiene un `marca/avatar.json`, ahí; si no, en el `prompts.md` de la entrega. No hace falta crear ningún archivo de marca para seguir. Una voz creada que nadie apuntó es una voz que se paga dos veces.

Lo demás de audio (música, efectos, clonar con más control) lo cubre la skill `audio`.
