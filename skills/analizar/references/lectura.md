# Leer un análisis con honestidad

Última revisión: noviembre 2026.

## Qué devuelve cada herramienta

### `video_analysis_status` (y cada elemento de `video_analysis_jobs`)

| Campo | Qué es |
|---|---|
| `id` | Id del análisis (el `video_analyze_id`) |
| `status` | `queued` al crear; `completed` o `failed` al terminar |
| `fail_reason` | Motivo, si falló |
| `video_input_id` | El video subido, si se analizó un archivo |
| `youtube_url` | El enlace, si se analizó YouTube |
| `scenes` | La lista de escenas |
| `created_at`, `updated_at` | Fechas en UTC |

`video_analysis_jobs` añade `total_count` y un `cursor` para pedir la página siguiente (más antigua).

Cada escena: `scene_number`, `timestamp_start`, `timestamp_end`, `label`, `shot_type`, `visual`, `audio`.

Etiquetas de `label` vistas en análisis reales: Opening Hook, Product Information, Product Selling Points, Real Experience, Call to Action. Pueden aparecer otras: no trates esta lista como cerrada.

### `virality_predictor`

Abre un tablero interactivo. Lo que el modelo evalúa, según la herramienta: potencial viral, interacción, atención, respuesta de la audiencia, riesgo de abandono, fuerza del gancho y rendimiento creativo.

La forma exacta de los datos que devuelve al asistente no está documentada en el esquema. Regla práctica: lee la respuesta de la llamada. Lo que venga ahí lo puedes citar; lo que solo esté dibujado en el tablero, lo ve la persona y tú no.

## Lo que el desglose sí permite afirmar

Son hechos que salen de contar y medir el propio desglose:

- Cuántas escenas hay y cuánto dura cada una (resta de tiempos).
- Ritmo de corte: duración media de escena, dónde se acelera o se frena.
- En qué segundo aparece el producto, la marca, una persona o el texto.
- Cuánto del video ocupa cada función (`label`): gancho, producto, llamada a la acción.
- Variedad de planos (`shot_type`).
- Qué hace el audio en cada tramo y si acompaña al corte.

## Lo que no permite afirmar

- Que el video "funcionó" o cuánto retuvo. No hay datos de audiencia.
- Por qué la gente lo compartió.
- Cifras de rendimiento de cualquier tipo.
- Que una técnica "siempre" funciona.

Puedes proponer hipótesis, pero con esa palabra delante.

## Plantilla de entrega del desglose

```
Video: <título o descripción> · <duración> · <N> escenas

Estructura
| # | Tiempo | Función | Plano | Qué pasa | Audio |
|---|--------|---------|-------|----------|-------|

Lo que se observa (hechos)
- <dato con tiempo>

Lo que interpreto (hipótesis)
- <lectura, marcada como interpretación>

Si lo quieres replicar
- <2 o 3 decisiones concretas y accionables>

Sin verificar
- <lo que no se pudo comprobar>
```

Traduce `visual` y `audio` al idioma de la persona y resúmelos: no pegues párrafos enteros en inglés. Conserva los tiempos tal cual.

## Plantilla de entrega de la predicción

```
Qué dice la herramienta
- <solo lo que vino en la respuesta, con sus palabras o cifras>

Qué leo yo
- <interpretación, apoyada en momentos concretos del video>

Qué cambiaría primero
- <una o dos acciones, la más barata primero>

Límite
- Es una estimación de un modelo sobre el video, no una garantía de resultado.
```

Si la respuesta de la herramienta no trajo datos legibles, dilo así: "El tablero está abierto con el detalle; a mí no me llegaron las cifras, así que no las voy a adivinar. Dime qué ves en gancho y retención y lo trabajamos."

## Usar las dos juntas

1. Desglose primero: sabes qué hay y cuándo.
2. Predicción después: sabes dónde apunta el problema.
3. Cruza: si la predicción señala un gancho flojo, mira qué pasa en las primeras escenas del desglose y propón un cambio concreto ahí.

No lances las dos por defecto. Si pidieron una, haz una.

## Video largo

El servidor avisa que la precisión baja con la duración. Opciones para ofrecer:

- Analizar solo el tramo que importa (recorte con la skill `editar`).
- Partir en bloques y analizar los relevantes.
- Analizarlo entero sabiendo que las escenas pueden salir menos finas, y decirlo en la entrega.

## Contenido de terceros

Analizar un anuncio ajeno para entender su estructura está bien. Al recomendar, apunta a replicar la **estructura** (orden, ritmo, función de cada escena), no a copiar marcas, personajes, música ni textos de otro.
