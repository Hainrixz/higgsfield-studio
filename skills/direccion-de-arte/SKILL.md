---
name: direccion-de-arte
description: Dirección de arte para imágenes generadas. Convierte un pedido flojo en un prompt con decisiones de fotógrafo (sujeto, composición, luz, lente, fondo, materiales, paleta, exclusiones) para que la imagen no salga genérica ni se vea a IA. No genera por sí sola; prepara el prompt que usan `imagen`, `producto`, `anuncios` y `personajes`, y sirve para diagnosticar una imagen que salió mal. Úsala si dices "mejora mi prompt", "me sale genérico", "se ve a IA", "se ve falso", "que parezca foto de verdad", "que se vea profesional", "qué luz le pongo", "qué lente uso", "hazme el prompt para…", "por qué salió así" o "dale dirección de arte". EN: image prompt craft, lighting, lens, composition and anti-AI-look checklist for Higgsfield image generation.
license: MIT
---
<!-- Copyright (c) 2026 Enrique Rocha (@soyenriquerocha) · tododeia.com · id er-ad5e0917 -->

# Dirección de arte

Una imagen genérica es una imagen en la que el modelo decidió por ti. Esta skill es el método para decidir antes: once bloques, en orden, cada uno una decisión que tomaría un fotógrafo. No llama a Higgsfield; deja el prompt listo para la skill que genera (`imagen`, `producto`, `anuncios`, `personajes`) y las reglas de la llamada son las de `estudio`.

No es un trámite ni una parada. Se hace en silencio y se sigue generando: la persona pidió una imagen, no una entrevista.

## Cuándo se activa

- La imagen tiene que verse profesional: producto, campaña, portada, retrato de marca.
- El pedido llegó en una línea ("una foto de mi café") y hay que completar lo que falta.
- Ya se generó y salió plana, de catálogo barato o con cara de IA: toca diagnosticar.
- Piden el prompt y nada más, para pegarlo ellos.

No hace falta para un boceto rápido, un icono, un meme o cuando la persona ya trae su prompt y quiere ese.

## Procedimiento

1. **Decide para qué es.** Una frase: qué es la imagen y dónde va a vivir (anuncio de Instagram, ficha de tienda, portada). De ahí salen la proporción y cuánto aire dejar para texto.
2. **Recoge lo que ya hay.** Lo que dijo la persona, la foto de referencia si existe y, si hay un `marca.json` en el proyecto, su paleta y su tono. Si no existe `marca.json`, sigues con lo que haya: no lo pidas ni lo crees.
3. **Completa lo que falta tú.** No preguntes por la luz o el lente: elige con las tablas de `references/luz-y-lente.md` según el tipo de imagen. Pregunta solo si falta algo que no puedes inferir y que cambia todo (qué producto es, qué texto lleva).
4. **Escribe los once bloques** en el orden de `references/bloques.md`. Lo innegociable arriba.
5. **Pásalo por la revisión de veinte segundos** de `references/antipatrones.md`.
6. **Tradúcelo al inglés** para enviarlo. El texto que deba leerse dentro de la imagen se queda en su idioma, entre comillas.
7. **Entrega a la skill que genera** y, al dar el resultado, di en una línea las dos o tres decisiones que tomaste ("luz lateral de ventana, 85 mm, frasco al tercio derecho"). Así la persona puede corregir con precisión.

## Los once bloques

| # | Bloque | La decisión |
|---|---|---|
| 1 | Concepto | Qué es y para qué sirve |
| 2 | Sujeto | Qué se ve, con material, color y estado |
| 3 | Composición | Encuadre, ángulo, colocación, aire libre |
| 4 | Luz | De dónde viene, qué tan dura, de qué color |
| 5 | Fondo | Liso, con textura o ambiente desenfocado |
| 6 | Materiales | Cómo se siente al tacto lo que se ve |
| 7 | Lente | Focal y apertura |
| 8 | Paleta | Colores que sí y colores que no |
| 9 | Estilo | Técnica descrita, nunca un nombre propio |
| 10 | Calidad | Dónde tiene que estar el detalle |
| 11 | Qué evitar | Exclusiones |

No todos pesan igual. Los que nunca se saltan: **sujeto, composición, luz y qué evitar**. Si solo puedes añadir una cosa a un prompt flojo, añade la luz.

## Qué cambia según el caso

| Caso | Lo que manda |
|---|---|
| Producto real con foto | El ancla de fidelidad junto al sujeto (está en `bloques.md`) y comparar con la foto al recibir |
| Pieza que llevará texto encima | Pedir la imagen sin texto y dejar un tercio del cuadro limpio |
| Texto dentro de la imagen | El texto exacto entre comillas, pocas palabras, con su sitio en el cuadro |
| Retrato o avatar | Piel con textura, asimetría, 85 mm, luz de ventana a 45° |
| Comida y bebida | Luz lateral suave y cálida; contraluz si hay vidrio, vapor o hielo |
| Editar una imagen existente | Solo el cambio y qué se queda igual; no los once bloques |
| Serie o carrusel | Mismos bloques de luz, paleta y estilo palabra por palabra; cambia sujeto y composición |
| Estilo de Soul o de Recraft elegido | El estilo ya trae luz y acabado: recorta los bloques 4, 9 y 10 y no lo contradigas |
| Imagen que luego se anima | Componer ya en la proporción del video y dejar espacio hacia donde irá el movimiento |

## Diagnóstico de una imagen que salió mal

| Se ve | Casi siempre es | Arreglo |
|---|---|---|
| Plana, sin volumen | Falta dirección de luz | Bloque 4: lateral, suave, con sombra |
| "A IA" | Todo perfecto, simétrico y enfocado | Asimetría, un plano de enfoque, imperfección explícita |
| Colores chillones | Saturación por defecto | "slightly desaturated, medium contrast" |
| El producto no es el suyo | Falta el ancla de fidelidad | Añadirla y pasar la foto como referencia |
| Letras inventadas | No se excluyó el texto | Exclusión de texto, o texto exacto entre comillas |
| Fondo que distrae | Fondo con más contraste que el sujeto | Fondo liso o desenfocado |
| Cara de maniquí | Piel retocada, simetría | "real skin texture, visible pores, unretouched" |

Cambia **un** renglón, di cuál, y regenera una vez. Repetir el mismo prompt esperando otra cosa es la forma más cara de trabajar.

## Errores comunes

- **Apilar superlativos** ("8k, masterpiece, ultra realistic"). No suman y diluyen lo que sí decidiste.
- **Nombrar a un fotógrafo o ilustrador.** Describe la técnica.
- **Escribir trescientas palabras.** Lo del final deja de pesar. Once bloques cortos.
- **Preguntarle todo a la persona.** Decide tú y cuenta qué decidiste.
- **Frenar por `marca.json`.** Es una ayuda si existe; nunca un requisito.
- **Mandar el prompt en español.** A Higgsfield, en inglés.
- **Aplicar los once bloques a una edición.** En una edición sobra casi todo.

## A dónde seguir

| Con el prompt listo | Skill |
|---|---|
| Generar la imagen | `imagen` |
| Fotos del producto real | `producto` |
| Creativos de anuncio | `anuncios` |
| Retrato o personaje que se repite | `personajes` |
| Animar el resultado (el prompt de movimiento es otro oficio) | `animar` |
| Elegir un estilo ya hecho en vez de escribirlo | `presets` |
