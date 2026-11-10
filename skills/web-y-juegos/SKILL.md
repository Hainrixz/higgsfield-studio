---
name: web-y-juegos
description: Construye y pone en línea sitios web, apps y juegos de navegador con Higgsfield, y usa las apps de su Marketplace. Crea el sitio, lo edita, lo deja en una dirección pública, revisa sus datos, lo lista en la comunidad, lo inscribe en el concurso de apps y publica juegos sueltos. Úsala si dices "hazme una landing", "necesito una página para mi negocio", "hazme una app que genere imágenes", "hazme un juego", "cambia el texto de mi sitio", "¿ya está en línea?", "cámbiale la dirección", "publica mi juego", "mételo al concurso" o "¿qué apps hay en Higgsfield?". EN: build, edit, ship and list websites, apps and browser games on Higgsfield; run Marketplace apps.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Webs, apps y juegos

Carga antes la skill `estudio`. Esta skill cubre el constructor de sitios de Higgsfield y sus apps de Marketplace.

**Lo primero, siempre:** `get_workflow_instructions` con `{workflow: "website-builder-flow"}`. El servidor lo exige antes de tocar cualquier herramienta de sitios. Ese flujo trae el stack, el contrato de diseño y las reglas duras, y **manda sobre esta skill**. Dice además que no busques otra guía de diseño fuera de él.

## Cómo le hablas a la persona

El flujo lo pide expresamente y aquí se respeta: la mayoría no es técnica. En el chat no nombres la mecánica interna (el almacén de código, sus copias, guardados y envíos, ni la cadena de puesta en línea). Haces esos pasos; no los narras.

| Estás haciendo | Dices |
|---|---|
| Crear el sitio y abrir su espacio de trabajo | "Estoy montando tu sitio…" |
| Guardar y enviar cambios | "Guardando tus cambios…" |
| Ponerlo en línea | "Tu sitio está listo: <url>" |
| Listarlo en la comunidad | "Publicando tu sitio…" |

Única excepción: una persona claramente técnica que pregunta por esa mecánica. Entonces respondes sin rodeos.

## Cuándo se activa

- Quieren un sitio, una landing, una app o un juego nuevo.
- Quieren cambiar, renombrar, revisar o publicar uno que ya tienen.
- Preguntan qué apps hay o quieren usar una.

## Tres tipos, y lo elige la persona

| Tipo | Qué es | Plantilla |
|---|---|---|
| `website` | Sitio independiente, con marca propia, **sin** generación con IA ni inicio de sesión de Higgsfield | `scroll-scrub` si es animado; ninguna si no |
| `app` | Producto integrado con Higgsfield: sus usuarios entran con su cuenta y generan imágenes o video | Obligatoria: `studio`, `preset` o `app-detail` |
| `game` | Juego de navegador con salas en tiempo real (también de un jugador) | Ninguna; la categoría es un género de juego |

Regla del servidor: **si genera imágenes, video o audio, es `app`**. No existe la opción de "traer tu propia API de generación" en un `website`. Detalle de tipos y plantillas en `references/tipos-y-plantillas.md`.

## Preguntas de arranque (son del servidor, no un freno nuestro)

En **un solo mensaje**, antes de crear:

1. El tipo, si la petición no lo deja claro.
2. Si quiere listarlo en la comunidad de Higgsfield cuando esté listo (sí o no). Recuerda la respuesta: con un sí, se lista solo al final sin volver a preguntar.
3. Solo para `website`: **animado (recomendado) o no animado**. El flujo marca esta pregunta como obligatoria aunque la petición parezca implicarlo.

No preguntes nada más para empezar: el nombre de la dirección lo eliges tú.

## Procedimiento

1. `get_workflow_instructions` con `{workflow: "website-builder-flow"}` y, según el tipo, la referencia que indique (`references/website-flow.md`, `references/app-flow.md` o `references/game-flow.md`) con `get_workflow_bundle_file`.
2. `list_website_categories` → los slugs válidos de categoría.
3. `create_website` con `type`, `category`, `subdomain` y, si aplica, `template`. Devuelve `website_id`: va en todas las llamadas siguientes.
4. `website_repo_access` con `operation: "checkout"` → te da la carpeta de trabajo dentro del sandbox.
5. Editar y guardar con `sandbox_exec` en esa carpeta. En una app, lee primero `app/src/layouts/AGENTS.md` y `app/src/components/AGENTS.md`; en un juego, `app/AGENTS.md`.
6. Portada y metadatos: **son parte de construir, no un extra**. Se rellenan en `app/src/app-meta.json` (`og_title`, `og_description`, `favicon_url`, `og_image_url`, `marketplace_cover_url`) siguiendo `references/app-cover.md`. La imagen de portada no requiere permiso; el **video** de portada sí (cuesta créditos): se ofrece, no se genera por tu cuenta.
7. `website_repo_access` con `operation: "push"` y comprobar `status: "pushed"`.
8. `deploy_website` → devuelve la dirección pública. Si dice `pending`, consulta `website_status`. Si falla, devuelve el registro: léelo, corrige y repite desde el paso 5.
9. Solo si dijeron que sí en el arranque o lo piden ahora: `publish_website`.

**Cada cambio posterior repite 4 → 8.** `publish_website` no pone nada en línea: solo lista lo que ya está publicado.

### Elegir la dirección (`subdomain`)

Ponla siempre; sin ella sale una al azar. Más de 4 caracteres, fácil de recordar, sacada del nombre o propósito (`lumen-notes`), solo minúsculas, dígitos y guiones sueltos. Si está tomada o reservada (`api`, `www`, `app`), prueba una variante cercana.

## Sitios que ya existen

| Quieren | Herramienta |
|---|---|
| Ver qué sitios tienen | `list_websites` (id, dirección, tipo, si está en línea) |
| Saber si quedó en línea | `website_status` |
| Cambiar la dirección | `rename_website` con `new_slug` |
| Ver los datos que guarda el sitio | `website_db` (solo lectura) |
| Ver qué claves tiene configuradas | `website_secrets` (solo nombres) |

- **`rename_website`**: la dirección vieja **deja de funcionar**. Dilo antes y da la nueva al terminar. Tarda un par de minutos; datos y archivos se conservan.
- **`website_db`**: `operation` `tables`, `schema` (pide `table`), `rows` (pide `table`; admite `filters`, `order_by`, `limit`, `offset`) o `query` (un solo `SELECT`/`WITH` en `sql`). Son los datos reales del sitio en vivo. No escribe.
- **`website_secrets`**: nunca devuelve valores. Las claves se ponen o quitan en los ajustes del sitio dentro de Higgsfield; **no pidas que las peguen en el chat** ni las escribas en el código. Un cambio de claves se aplica en la siguiente puesta en línea.

## Listar, concurso y juegos sueltos

Son acciones hacia fuera: **solo si la persona lo pidió** (o dijo que sí en el arranque).

- **`publish_website`**: lista en la comunidad la versión que ya está en línea. Sin `og_title` el sitio queda invisible en el feed.
- **`participate_in_contest`**: inscribe el sitio en el concurso vigente con `website_id` y `urls` (de 1 a 10 enlaces de YouTube, X, Instagram o TikTok; otro dominio se rechaza). Necesita estar en línea y con metadatos; lo lista automáticamente. La publicación en redes la hace la persona: pídele el enlace. Llamarla otra vez **sobrescribe** los enlaces. Premios, fechas y reglas: lee `references/contest.md` en vivo y no los cites de memoria.
- **`publish_playable_game`**: publica en la comunidad un juego de Playable Ads (`playable_id`) o un juego hecho en la conversación como un único `.html` autocontenido de hasta 32 MiB (`file_id`, con `name` y `cover_url`). Devuelve `pending` y un `app_id`. Consulta `get_playable_game_publication` más o menos una vez por minuto; cuando esté en vivo, `publish_website` con `website_id` = ese `app_id` para listarlo.

Un juego creado con `create_website` y `type: "game"` **no** usa esas dos herramientas: se pone en línea y se lista igual que cualquier sitio.

## Apps del Marketplace

`apps_search` → `apps_describe` → `apps_invoke`, en ese orden.

1. `apps_search` (con `query` o sin ella) → `app_id`, nombre y acciones.
2. `apps_describe` con `app_id` y `action` → el esquema exacto de argumentos y la `manifest_revision`. Mira sus anotaciones de costo y efectos.
3. `apps_invoke` con `app_id`, `action`, `arguments` y esa `manifest_revision`. Los medios se pasan como `media_id`, nunca como bytes.

Las acciones largas devuelven `{id, status: "queued"}`. Si hay widget, él hace el seguimiento: no vuelvas a invocar para consultar. En un cliente de solo texto, consulta con la acción de estado de la app. Si responde `manifest_changed`, vuelve a describir. El servidor pide confirmar con la persona antes de una acción cara o destructiva: mira las anotaciones.

## Errores comunes

- **Tocar herramientas de sitios sin cargar el flujo.** Sales con plantilla o tipo equivocado.
- **Creer que listar pone en línea.** Tras un cambio, primero se pone en línea y luego se lista.
- **Mezclar plantillas.** Una de app en un sitio (o al revés) se rechaza. `custom` solo si la persona dice literalmente que la quiere.
- **Dejar la portada "para después".** Sin `og_title` y portada el trabajo está incompleto.
- **Pedir una clave por chat.**
- **Reiniciar el sandbox con cambios sin enviar.** Se pierden.
- **Archivos pesados dentro del sitio.** Ningún archivo de más de 25 MiB; los medios grandes se alojan fuera.
- **Gastar turnos.** Escribe cada archivo una vez y completo, agrupa llamadas independientes y no vuelvas a descargar tus propias generaciones para mirarlas.

## A dónde ir

| Quieren | Skill |
|---|---|
| Imágenes o video para el sitio | `imagen`, `video`, `producto` |
| Modelos 3D para un juego | `tres-d` |
| Música y efectos para un juego | `audio` |
| Difundirlo en TikTok | `publicar` |
| Saldo y créditos | `cuenta` |
