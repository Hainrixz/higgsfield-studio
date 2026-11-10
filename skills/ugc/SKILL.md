---
name: ugc
description: Videos estilo UGC con Higgsfield, con una persona hablando a cámara o mostrando el producto. Review de creador, producto con voz en off, unboxing, try-on, tutorial paso a paso y recorrido de una web o app. Úsala si dices "un video UGC de mi producto", "alguien recomendando mi producto", "una creadora hablando a cámara", "un review estilo TikTok", "un unboxing", "un try-on", "un tutorial de cómo se usa", "un UGC de mi SaaS" o "un video desde este link". EN: UGC-style videos (creator review, product voiceover, unboxing, try-on, tutorial, website tour).
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# UGC: una persona, un producto, un teléfono

Carga antes la skill `estudio`. Aquí va lo propio del UGC: qué formato elegir, el orden que impone el workflow del servidor y dónde está la línea entre una demostración honesta y un testimonio inventado.

El UGC es un video que parece grabado por alguien con su teléfono. En Higgsfield lo produce **un solo workflow, `ugc-video`**, con seis formatos. Los flujos separados de antes (`ugc-review-video` y parientes) ya no existen.

## Cuándo se activa

- Piden un video terminado con creador a cámara, o del producto con voz en off estilo creador.
- **No** es esta skill: un guion o un plan sin video; un comercial mudo de producto (`video`); un anuncio estático (`anuncios`); un video narrado sin presentador (`presets`, comando `/content-factory`, o el workflow `faceless-video`); un reel con presentador fijo y motion graphics (`presets`, comando `/shorts`); editar metraje que ya existe (`editar`).

## Qué formato

| Piden | Formato | Perfil a cargar |
|---|---|---|
| Alguien hablando del producto, o contando una historia sin producto. **Es el caso por defecto** | review | `references/formats/review.md` |
| Solo el producto, con voz en off. Nadie habla a cámara | product | `references/formats/product.md` |
| Abrir el paquete y reaccionar | unboxing | `references/formats/unboxing.md` |
| Ponérselo y enseñar cómo queda | try-on | `references/formats/try-on.md` |
| Paso a paso con rótulos "Step N" | tutorial | `references/formats/tutorial.md` |
| La web o la app en pantalla, con capturas reales y un presentador | website | `references/formats/website.md` |

Un enlace de producto **no** convierte el pedido en website: solo si la página misma tiene que verse. El formato es una decisión tuya, no un argumento de ninguna herramienta. Más reglas de ruteo en `references/familia-ugc.md`.

## Procedimiento

1. **Carga el workflow:** `get_workflow_instructions` con `{ workflow: "ugc-video" }`. Luego, con `get_workflow_bundle_file`, **solo** el perfil del formato elegido y las referencias que ese perfil nombre.
2. **Filtro de verdad y permiso**, antes de gastar nada. Es regla del workflow y no se rodea:
   - Creador generado adulto, o una persona adulta no pública cuyo permiso está claro. Nada de famosos, menores ni suplantación.
   - Las afirmaciones del producto son una lista cerrada: lo que dio la persona, palabra por palabra. Sin lista, el guion habla solo de lo que se ve (material, cómo se abre, cómo se aplica).
   - Un creador generado es presentador, nunca cliente: no dice que lo compró, lo usa o le funcionó.
3. **Lo que se pregunta, una sola vez y junto:** la duración (el workflow exige un número entero de al menos 4 s y prohíbe asumirlo; ofrece 10, 15, 30 o 45) y, si no hay, la foto del creador o al menos su género. Nada más: ni modelos, ni resolución, ni tableros. Si falta el producto en un review, no se pide: sale un video guiado por la historia.
4. **Sube lo que haya** (foto del producto, foto del creador) como dice `estudio`. Una URL de imagen entra con `media_import_url`.
5. **Planea la duración** con el script del workflow en `sandbox_exec` (`references/duration.md`). Devuelve cuántos clips y de cuánto; cada clip dura entre 4 y 15 s. Usa esos números exactos.
6. **Fija al creador.** Si no hay foto autorizada: una imagen con `soul_2`, `3:4`, calidad `2k`, por `generate_image_batch`. Ese resultado es la identidad de todo el video; no se regenera a mitad.
7. **Escribe el monólogo** con la referencia de oficio del workflow y pártelo en tantos segmentos como clips.
8. **Tableros** (formatos físicos): una imagen `21:9` por clip con `gpt_image_2_6`, uno tras otro. Cada tablero pasa por la limpieza obligatoria de `references/boards.md` y se inspecciona. Solo el tablero limpio alimenta el siguiente paso; si la limpieza falla, se para ahí.
9. **Clips:** escribe todos los prompts primero y luego `generate_video_batch` con `seedance_2_5`, `9:16`, `1080p`, `mode: "omni_reference"`, `generate_audio: true`. La voz sale del propio clip: **no** se genera narración aparte.
10. **Espera** con `jobs_wait` y revisa cada clip: misma cara, mismo producto, duración real, habla, sin texto inventado. Corrige solo el clip que falló.
11. **Montaje:** carga el workflow `video-montage` y une los clips en `sandbox_exec`. Subtítulos y paquete de publicación son opcionales y solo si los pidieron.
12. **Entrega** el video confirmado. Comprueba el archivo real, no solo que el trabajo terminó.

## Decisiones rápidas

| Situación | Qué haces |
|---|---|
| No dijeron idioma | El workflow habla **inglés con acento americano** por defecto. Si la persona te escribe en español, fija el español y el acento en el brief de forma explícita |
| Quieren que salga su presentador de siempre | La foto o la hoja de ese personaje es el creador. Lo arma `personajes` |
| Quieren "que diga que lleva tres meses usándolo" | No. Ofrece demostración, la promesa de la marca en boca de un presentador, o el testimonio real de un cliente real |
| Algo rápido de 12 a 15 s sin tanto proceso | `marketing_studio_video` o el widget `show_marketing_studio_v2` con la pestaña `ugc` (lo cubre `anuncios`) |
| Un modelo fijado por el workflow no está disponible | Se para esa fase y se dice. No se sustituye |
| Un clip sale moderado | Se detiene lo que depende de él. No se cambia de proveedor ni se quitan referencias para colarlo |

## Errores comunes

- Asumir 15 s. El servidor pide el número.
- Cargar los seis perfiles "por si acaso".
- Lanzar una narración con `generate_audio` encima de clips que ya traen voz.
- Seguir con un tablero sin limpiar.
- Reenviar la tanda completa porque falló un índice. Se reintenta ese índice, una vez.
- Correr `ffmpeg` o el montaje en tu máquina. Todo eso va en `sandbox_exec`.
- Dejar que el video salga en inglés porque nadie fijó el idioma.
- Presentarlo como reseña orgánica. Es una demo de marca o un creativo patrocinado.

## A dónde seguir

| Quieren | Skill |
|---|---|
| Un presentador con la misma cara siempre | `personajes` |
| Fotos del producto para usar de referencia | `producto` |
| Doblarlo a otro idioma o cambiar la voz | `audio` |
| Subtítulos, recortes, otra proporción | `editar` |
| Varias versiones del video ya hecho | `anuncios` (Ad Multiplier) |
| Predecir retención y gancho | `analizar` |
| Subirlo a TikTok | `publicar` |

El brief y los ganchos: `references/brief.md`. Ruteo fino entre formatos y lo que no es UGC: `references/familia-ugc.md`.
