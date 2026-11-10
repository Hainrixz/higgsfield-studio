---
name: cuenta
description: Tu cuenta de Higgsfield desde Claude. Dice cuántos créditos te quedan y en qué se fueron, te pasa los enlaces de planes y recargas, cancela la renovación de la prueba gratis, cambia de espacio de trabajo, y ordena tu material en proyectos y carpetas (crear, renombrar, mover, archivar, borrar). También te enseña tu historial de generaciones y tus archivos subidos. Úsala si dices "¿cuántos créditos me quedan?", "¿en qué gasté?", "quiero más créditos", "¿qué planes hay?", "cancela la renovación", "cámbiame al espacio del equipo", "crea un proyecto para este cliente", "guarda todo en una carpeta", "mueve esto a otro proyecto", "borra ese proyecto", "enséñame lo que generé ayer" o "¿qué fotos tengo subidas?". EN: Higgsfield balance, billing links, workspaces, projects, folders and generation history.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Cuenta: saldo, espacios, proyectos e historial

Carga antes la skill `estudio`. Esta skill administra la cuenta; no genera nada.

Dos velocidades, y conviene no confundirlas:

- **Leer es libre.** Saldo, movimientos, listas, historial: lo haces en cuanto lo piden, sin preguntar.
- **Cambiar la cuenta es solo a petición.** Borrar, archivar, cambiar de espacio de trabajo, tocar preferencias o la facturación: únicamente si la persona lo pidió con esas palabras. Nunca "de paso" ni "para ordenar".

Crear un proyecto o una carpeta, mover o renombrar algo cuando lo piden es trabajo corriente: se hace y ya.

## Cuándo se activa

Preguntan por créditos, gasto, planes o recargas; quieren ordenar o encontrar algo que generaron o subieron; o tienen más de un espacio de trabajo.

## Saldo y dinero

| Piden | Herramienta | Nota |
|---|---|---|
| Cuánto queda | `balance` | Créditos y tipo de plan |
| En qué se gastó | `transactions` | Gasto, reembolso, abono y deducción, del más nuevo al más viejo. `size` (10 por defecto) y `cursor` con el `next_cursor` |
| Planes, precios, recargar | `show_plans_and_credits` | Ver abajo |
| Cancelar la renovación de la prueba | `cancel_trial_auto_renewal` | Ver abajo |

**`show_plans_and_credits`: tú no compras nada.** Abre el cuadro de planes y recargas y devuelve un texto con enlaces de pago. **Reproduce esa respuesta tal cual, con sus enlaces**; no la resumas ni digas solo "ya se abrió". El pago lo hace la persona en esos enlaces. Elige `intent` según lo que pidan: `auto_refill` si se quedaron sin créditos, `topup` para un paquete suelto, `upgrade` para subir de plan o cuando un modelo exige plan mínimo, `trial` si preguntan por la prueba gratis y `general` para comparar.

Si la respuesta trae `free_trial`, copia su nota de condiciones literal. Si no la trae, no especules sobre si califican a una prueba. En un equipo, si son miembro y no dueño, no hay enlaces: solo el dueño compra. No inventes enlaces.

**`cancel_trial_auto_renewal`, en dos pasos (regla del servidor):**

1. Primera llamada **sin** `confirm` (o `confirm: false`). Muestra la confirmación; en un cliente de solo texto, copia `assistant_response` tal cual y espera.
2. Solo cuando la persona confirme explícitamente en el chat: segunda llamada con `confirm: true`. Nunca a la primera.

Aclara qué significa: se detiene el cobro al terminar la prueba, y **conserva** el acceso y los créditos de prueba hasta entonces.

## Espacios de trabajo

`list_workspaces` → cada uno con `id`, tipo, rol, plan, créditos e `is_selected` (el que está activo).

`select_workspace` con `workspace_id` cambia el espacio contra el que se **cobra y se lee todo**: generaciones, saldo, movimientos, subidas. El cambio **persiste entre sesiones y clientes** hasta que se cambie otra vez; `clear: true` vuelve al privado. Por eso solo se hace si lo piden, y al hacerlo dices en una línea a dónde se va a cobrar desde ahora.

Si hay más de un espacio y van a gastar, confirma cuál antes de la primera operación de pago (lo pide el servidor). Con un solo espacio, no preguntes nada.

Casi todas las herramientas de proyectos piden `workspace_id` como contexto: sácalo de `list_workspaces`. Pasarlo ahí **no** cambia el espacio seleccionado.

## Proyectos y carpetas

Un proyecto agrupa material; dentro hay carpetas. Mapa completo de parámetros en `references/proyectos-y-carpetas.md`.

### Crear un proyecto y generar dentro

1. `list_workspaces` → `workspace_id`.
2. `create_project` con `name`, `workspace_id` y una `idempotency_key` que eliges una vez. Devuelve `project_id` y `default_folder_id`.
3. En las generaciones de esta conversación pasa `folder_id` = ese `default_folder_id`. Reutilízalo; no crees un proyecto por generación.

Se crea proyecto **solo** si lo piden o si `get_preferences` devuelve `auto_create_project: true`. Por defecto es `false`: se genera sin proyecto. Si la creación queda dudosa, repite con la **misma** `idempotency_key` (vale 15 minutos); una nueva crea un duplicado.

`update_preferences` cambia esa preferencia guardada. Úsala solo cuando pidan "crea siempre un proyecto" o "deja de hacerlo". Un "hazme un proyecto para esto" es un encargo puntual y no toca la preferencia.

### Qué herramienta

| Quieren | Herramienta |
|---|---|
| Ver o buscar proyectos | `list_projects` (`search` por nombre) |
| Datos y permisos de uno | `get_project` |
| Renombrar, describir, color, emoji, portada | `update_project` |
| Guardar sin borrar | `archive_project` / `unarchive_project` |
| Borrar para siempre | `delete_project` |
| Subcarpeta nueva | `create_folder` |
| Carpetas de un nivel, una por id, o buscar en todo el proyecto | `list_folders`, `get_folder`, `search_folders` |
| Mover o renombrar carpeta | `move_folder`, `rename_folder` |
| Borrar carpeta | `delete_folder` |
| Ver qué hay dentro | `list_project_assets` |
| Prompt con que se hizo algo; enlace de descarga | `get_project_asset_prompt`, `get_project_asset_source` |
| Meter en una carpeta algo ya generado o subido | `attach_project_asset` |
| Copiar o mover entre carpetas o proyectos | `copy_project_asset`, `move_project_asset` |
| Sacar algo del proyecto | `remove_project_asset` |
| Saber dónde está colocado un trabajo | `resolve_project_assets` |

Dos ids que no son lo mismo: `placement_id` es **dónde está colocado** algo dentro del proyecto; `item_id` es el trabajo o la subida original. Mover, copiar, quitar y leer prompt usan `placement_id`. `list_project_assets` no devuelve prompts ni enlaces: para eso están las dos herramientas de lectura.

### Borrar y quitar

| Acción | Qué pasa | Vuelta atrás |
|---|---|---|
| `archive_project` | Se guarda fuera de la vista | Sí, `unarchive_project` |
| `remove_project_asset` (`confirm_remove: true`) | Quita esa colocación; el archivo o el trabajo original siguen existiendo | Se puede volver a adjuntar |
| `delete_folder` (`confirm_delete: true`) | Borra la carpeta. `cascade` es `false` por defecto: con contenido puede rechazarse | No |
| `delete_project` (`confirm_delete: true`) | Borra el proyecto y **todo** lo que contiene | **No** |

Antes de un borrado definitivo: di qué se va a borrar (nombre y cuántas cosas contiene), ofrece archivar si encaja, y procede solo con el sí de la persona. No pongas `cascade: true` si no pidieron borrar también el contenido. Si el resultado queda dudoso, **no repitas**: mira primero cómo quedó.

## Historial y visores

| Quieren | Herramienta |
|---|---|
| Repasar lo generado | `show_generations` (`type`: `image`, `video`, `audio`, `3d`) |
| Ver sus archivos subidos | `show_medias` (un `type` por llamada; `image` por defecto) |
| Volver a ver un resultado concreto | `job_display` con su id |
| Mostrar un video final exportado | `show_result` |

- `show_generations` es historial: úsalo solo cuando pidan repasar. Nunca para mostrar una tanda recién hecha (eso lo resuelve `estudio`). Con `only_completed: false` incluye lo que aún se está generando: sirve para comprobar si algo se lanzó tras un timeout.
- `show_medias`: no recorras los tres tipos por tu cuenta. Sirve para reutilizar un archivo sin subirlo otra vez.
- `job_display`: uno solo. Si el trabajo viene de una carpeta compartida, pasa también su `folder_id`.
- `show_result`: para un **video final** ya verificado. Pide `action` y exactamente uno de `media_id` o `url` pública (hasta 50 MB). Nunca un id de trabajo, una ruta local ni un render a medias.

## Errores comunes

- **Resumir `show_plans_and_credits`** y dejar a la persona sin enlaces.
- **`confirm: true` en la primera llamada** de cancelación.
- **Cambiar de espacio de trabajo "para probar"** y dejar la cuenta cobrando en otro lado.
- **Confundir `placement_id` con `item_id`.**
- **Dar por terminada una lista** porque una página vino vacía. Si `has_more` es verdadero, sigue con el `cursor` y los mismos filtros.
- **Decir que algo "se borró del todo".** El servidor no promete purgar los archivos subidos originales.

## A dónde ir

| Quieren | Skill |
|---|---|
| Conectar Higgsfield o subir archivos | `estudio` |
| Publicar un proyecto en la galería | `publicar` |
| Sitios, apps y sus datos | `web-y-juegos` |
| Marcas, productos e historial de anuncios | `anuncios` |
| Personajes y voces guardadas | `personajes`, `audio` |
