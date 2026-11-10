# Tipos, plantillas, categorías y límites

Última revisión: noviembre 2026. Resume `website-builder-flow` y los esquemas de las herramientas. El flujo cargado en vivo manda.

## Qué se construye

Un solo producto por sitio: una app React 19 + TanStack Start, renderizada en servidor, en su propia dirección pública (`<subdomain>.higgsfield.app`). El proyecto vive en `app/`; los comandos de construcción se corren desde ahí. Base de datos, archivos y otros servicios existen pero vienen **desactivados** por defecto.

No hay etapa de vista previa separada: cada puesta en línea deja la versión pública.

## Cómo distinguir el tipo

| Señal en la petición | Tipo |
|---|---|
| Landing, portafolio, sitio de marketing, SaaS con sus propios usuarios, sin generación con IA | `website` |
| Genera imágenes, video o audio; usa modelos, créditos o historial de Higgsfield | `app` |
| Un juego | `game` |

### `website`

- Marca totalmente independiente: paleta, tipografía y estilo propios, solo Tailwind/CSS a medida.
- Nunca componentes ni tokens de Quanta, ni insignias de "hecho con Higgsfield". La única marca en la página es la de la persona.
- Sin generación con IA de ningún proveedor. Sí puede usar servicios corrientes (pagos, mapas, correo) con las claves de la persona.
- **Animado** (`template: "scroll-scrub"`): el desplazamiento de la página reproduce una película generada. El motor ya viene hecho; tú generas la película y rellenas las escenas. Por defecto es una sola toma continua de unos 15 s; la versión de varias escenas es opcional y tarda varios minutos más por tramo. Guía: `references/scroll-scrub.md`.
- **No animado**: se omite `template`.

### `app`

- Debe verse y sentirse como un producto de Higgsfield: interfaz con Quanta (`references/quanta-design.md`). Lo que Quanta no tenga se construye con sus primitivas, nunca con otra librería de interfaz.
- La generación corre con los créditos del usuario final, por el SDK de Higgsfield.
- `template` es obligatoria. La plantilla llega como código real ya conectado como página de inicio: **se adapta en su sitio**, no se reconstruye.

| Plantilla | Para qué |
|---|---|
| `studio` | Espacio creativo completo: barra de proyectos, caja de prompt flotante y muro de generaciones |
| `preset` | Elegir un estilo y generar: panel de creación a la izquierda junto a una rejilla de estilos con pestaña de historial. Base también de asistentes paso a paso |
| `app-detail` | La página de una sola herramienta: generador y pasos de cómo funciona. La "app simple" |
| `custom` | Carcasa vacía. **Solo** si la persona dice que quiere la plantilla personalizada |

La plantilla es solo la carcasa con datos de ejemplo. El entregable es el producto real con su lógica completa: una plantilla que solo se pinta no está terminada.

### `game`

- El juego son seis funciones puras en `app/src/logic.js` (`meta`, `setup`, `validateAction`, `applyAction`, `isGameOver`, `viewFor`). Salas, conexiones y guardado ya los pone la plataforma.
- `validateAction` es la única defensa: el cliente puede mandar cualquier cosa. `viewFor` decide qué ve cada jugador.
- Un jugador también vale: `meta` con `minPlayers: 1`.
- No lleva plantilla; nombrar una da error.
- Para arte y sonido, el flujo trae sus referencias (`references/game-design-system.md` primero, luego `references/game-stylization.md`).

## Categorías

`create_website` exige `category` y rechaza un slug desconocido. Consulta siempre `list_website_categories`.

Categorías de sitio y app vistas en noviembre de 2026: `viral-trends`, `ads-marketing`, `ugc-social`, `cinematic`, `characters-avatars`, `product-ecommerce`, `portrait-lifestyle`, `other`. Usa `other` si ninguna encaja.

Para juegos el flujo pide un **género**: `arcade`, `puzzle`, `shooter`, `platformer`, `rpg`, `strategy`, `racing`, `simulation`, `adventure`, `action`, `fighting`, `survival`, `horror`, `sports`, `card-board`, `education`, `endless-runner`, `moba`, `music-rhythm`, `sandbox-building`. Ojo: en la revisión de noviembre de 2026, `list_website_categories` devolvió solo las ocho categorías de sitio y ningún género. Si pasa lo mismo, usa el género de esta lista que mejor encaje y, si el servidor lo rechaza, guíate por el mensaje de error.

## El espacio de trabajo

`website_repo_access` trabaja en modo "intermediado" en este conector: acepta `operation` `checkout` o `push`.

- `checkout` prepara la carpeta dentro del sandbox y devuelve su ruta. Reutiliza lo que ya hubiera; nunca borra trabajo.
- Se edita y se guarda con `sandbox_exec` en esa ruta.
- `push` envía lo guardado. Rechaza archivos sin guardar y envíos que no sean continuación directa. Espera `status: "pushed"`.
- Cada llamada reserva el sandbox 15 minutos. Envía cambios coherentes a menudo.
- No hay credenciales en el sandbox y no deben pedirse. Si `sandbox_exec` no está disponible, se informa ese requisito; no se pide un token como alternativa.
- Límites: 320 MiB por transferencia y ningún archivo de más de 25 MiB.

Si el esquema de `website_repo_access` solo aceptara `website_id` (modo directo), sigue las instrucciones que devuelva la propia herramienta.

## Portada y metadatos

Todo sitio, por pequeño que sea, sale con portada generada y metadatos reales en `app/src/app-meta.json`:

| Campo | Para qué |
|---|---|
| `og_title` | Título. Vacío = invisible en el feed |
| `og_description` | Descripción |
| `favicon_url` | Icono |
| `og_image_url` | Imagen al compartir |
| `marketplace_cover_url` | Portada de la tarjeta en la comunidad |
| `og_video_url` | Video de portada, **opcional y con permiso** |

Las etiquetas de la página se fijan al construir: tras cambiar metadatos hay que volver a poner el sitio en línea antes de listarlo.

## Poner en línea y listar

| Herramienta | Qué hace | Qué no hace |
|---|---|---|
| `deploy_website` | Construye y deja la versión pública; devuelve la dirección o el registro del fallo | No lista en la comunidad |
| `website_status` | Dice la dirección y el estado de la última puesta en línea | — |
| `publish_website` | Lista en la comunidad la versión que ya está pública | No pone en línea cambios nuevos |

Excepción: si el sitio nunca estuvo en línea, `publish_website` primero lo pone en línea (devuelve `pending`) y lo lista solo cuando termina.

## Juegos sueltos frente a juegos del constructor

| Origen del juego | Cómo se publica |
|---|---|
| Hecho con `create_website` y `type: "game"` | `deploy_website` y, si lo piden, `publish_website` |
| Juego de Playable Ads | `publish_playable_game` con `playable_id` |
| Un `.html` autocontenido hecho en la conversación | Subirlo con `media_upload` + `media_confirm`, luego `publish_playable_game` con `file_id`, `name` y `cover_url` (más `icon_url`, `description` y `game_type` si los hay) |

`get_playable_game_publication` devuelve `pending`, `live`, `failed` o `not_published`, la dirección en vivo y el error si falló. Volver a llamar a `publish_playable_game` sirve para subir una versión nueva o reintentar un fallo; mientras está pendiente no cambia nada. Una versión nueva de un juego por `file_id` es una subida nueva con su propia app. Los anuncios jugables no se publican, solo los juegos.
