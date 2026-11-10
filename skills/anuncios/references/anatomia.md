# La ficha de estructura

Aquí es donde el análisis escena por escena se convierte en algo reusable. Sin este paso tienes una descripción de un video ajeno; con este paso tienes un molde que puedes rellenar con lo tuyo veinte veces.

## Qué se toma y qué se deja

La regla se aplica campo por campo, no "en general".

| Se toma (es forma) | Se deja (es de ellos) |
|---|---|
| En qué segundo entra el gancho | Las palabras exactas del gancho |
| Qué **tipo** de gancho es (problema, resultado, contradicción, historia) | Su promesa concreta |
| Cuántos cortes tiene y cada cuánto | Su música, su tipografía, su arte |
| En qué orden se sueltan los argumentos | Sus argumentos |
| En qué segundo aparece el producto | Su producto |
| Dónde y cómo se contesta la objeción | Su forma de contestarla, si nombra a alguien |
| Dónde entra el precio, si entra | Su precio |
| Qué tipo de cierre usa | Su llamada a la acción, palabra por palabra |
| Qué se ve en pantalla en cada bloque | Su creador, su cara, su voz |

Si dudas de un campo, la prueba es simple: **¿esto sería igual de cierto para otro negocio del mismo nicho?** Si sí, es forma y se toma. Si describe a esa empresa en particular, es suyo y se deja.

## La plantilla

Se guarda como `estructura.md` en la carpeta de trabajo.

```markdown
# Estructura de: <marca> · <fecha del anuncio>
Fuente: <enlace o archivo de donde salió>
Duración: <segundos>
Señal de rendimiento: <inferencia, con su razón. Si no hay, N/A>

## El esqueleto

| Segundo | Qué pasa | Qué función cumple | Qué se ve |
|---|---|---|---|
| 0-3 | | Gancho de tipo <problema / resultado / contradicción / historia / especificidad> | |
| 3-8 | | | |
| 8-15 | | | |
| ... | | | |

## Ritmo
- Cortes totales: <n>
- Corte más largo: <s> · más corto: <s>
- Hay texto en pantalla: <sí/no> · aparece en el segundo <n>
- Habla alguien a cámara: <sí/no>

## Orden de los argumentos
1.
2.
3.

## La objeción
- Cuál atacan:
- En qué segundo:
- Cómo la resuelven (la técnica, no sus palabras):

## El cierre
- Tipo de llamada a la acción:
- Segundo en que aparece:

## Por qué esto funciona
Tres frases, máximo. Es lo que se transfiere a tu anuncio.

## Lo que NO se copia
La lista explícita de lo que se queda con ellos.
```

## Cómo se llena con lo que devuelve el análisis

`video_analysis_create` recibe **una** de dos cosas: `video_input_id` (el `media_id` de un video subido) o `youtube_url` (solo enlaces de YouTube). Devuelve un id que se consulta con `video_analysis_status` pasándolo como `video_analyze_id`. Cuando el estado llega a `completed` viene el desglose por escenas; si llega a `failed`, trae `fail_reason`. De ahí salen los tiempos, los cortes y qué se ve en cada bloque.

Un anuncio que solo existe en la Biblioteca de Anuncios, en TikTok o en Instagram no entra por enlace: hace falta el archivo, subido como dice `estudio`.

Lo que **no** sale de ahí y lo pones tú es la columna de **función**: qué está haciendo cada bloque en la cabeza de quien mira. Esa columna es la ficha entera; el resto es descripción.

Dos advertencias del propio servidor, que hay que trasladar:

- El análisis pierde precisión conforme el video se alarga. Un anuncio de 15 segundos sale fino; uno de tres minutos, no.
- Tarda 3 a 5 minutos. Se consulta cada 30 o 60 segundos, no en bucle.

Si algo del análisis no viene, va `N/A` con la razón. No lo completes "por lógica": una ficha con tres N/A honestos vale más que una completa a medias inventada.

## Los cinco tipos de gancho que vas a encontrar

Casi todos los anuncios que funcionan usan uno de estos. Nombrar cuál es te da el molde:

1. **Problema dicho en voz alta.** Empieza nombrando el dolor con las palabras del cliente. El más común y el más transferible.
2. **Resultado por delante.** Enseña el final primero, luego explica cómo. Funciona cuando el resultado es visible.
3. **Contradicción.** Ataca de frente una creencia que la audiencia da por cierta. Incomoda, y esa incomodidad detiene el dedo.
4. **Historia empezada a la mitad.** Arranca sin contexto, en medio de la acción. El cerebro se queda a cerrarla.
5. **Especificidad rara.** Un número concreto y poco redondo, que suena verificable justo porque es raro.

En la ficha se anota el tipo, no la frase. El tipo es tuyo para usar; la frase es de ellos.

## Y después

Con la ficha en la mano, el guion propio se escribe rellenando cada renglón con lo tuyo: tu problema, tu argumento, tu objeción, tu cierre. Los tiempos y el orden se respetan, porque eso es lo que se descubrió que funciona.

Antes de generar nada, lee el guion en voz alta y reescribe lo que no diría la persona con sus palabras. Un guion que sigue una estructura ajena tiende a sonar prestado, y ahí se nota.

Con qué se produce depende de lo que salga de la ficha: persona a cámara, skill `ugc`; anuncio corto de producto, `marketing_studio_video`; historia con personajes, micro-drama. El ruteo está en el `SKILL.md` de `anuncios`.
