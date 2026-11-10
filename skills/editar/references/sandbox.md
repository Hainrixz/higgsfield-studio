# `sandbox_exec`: edición en la nube

`sandbox_exec` ejecuta un comando de shell en una máquina Linux de Higgsfield. **No** es la computadora de la persona: no ve sus archivos ni instala nada en su equipo.

## Qué trae instalado

ffmpeg y ffprobe, ImageMagick, sox, python3 (con Pillow y faster-whisper), node/npm/npx, sharp-cli, Playwright con Chromium, fuentes para subtítulos (Metropolis, Montserrat), zip/unzip, git, curl y jq. Tiene internet.

Los scripts de los flujos del servidor ya están en `$HF_WORKFLOWS/<flujo>/scripts/`. Se ejecutan desde ahí; nunca pegues su contenido en el comando ni los reescribas.

## Parámetros

| Parámetro | Para qué |
|---|---|
| `command` | El comando bash. Corre en `/home/user`. Máximo 128 000 caracteres |
| `timeout_seconds` | Por defecto 60, máximo 120. Se ignora con `background` |
| `background: true` | Trabajo largo. Devuelve `pid`, `log_path` y `status_path`; límite de 15 minutos |
| `size: "xl"` | Solo para el render final más pesado. Se apaga cerca de un minuto después de terminar |
| `image_paths` | Hasta 4 PNG/JPEG (512 KiB en total) que te llegan como imagen para revisarlos. Solo con comando en primer plano |
| `restart: true` | Descarta el sandbox y empieza limpio. Pierdes archivos y procesos |
| `recover_sandbox_id` | Recuperar un sandbox que no responde. **Pregunta antes**: detiene todo lo que esté corriendo |

## Tiempos

- Hasta ~2 minutos: comando normal, sube `timeout_seconds` si hace falta.
- Más largo (render, instalación): `background: true` y luego consulta los archivos de log y estado con otra llamada. No uses `nohup`, `setsid` ni `&` por tu cuenta.
- Antes de lanzar otro render, mira si ya hay uno corriendo. No dupliques.

## Qué persiste

- `/home/user` se conserva 24 horas desde el último uso. Los procesos y la memoria no sobreviven a un reemplazo.
- Si la respuesta trae `sandbox_created: true`, el sandbox es nuevo: los archivos de llamadas anteriores ya no están. Vuelve a descargar las entradas.
- Exporta lo terminado. Lo que queda fuera de `/home/user` puede perderse.

## Traer archivos

Con `curl` desde una URL de medio: la que devuelve una generación o la de un archivo subido.

```bash
mkdir -p /home/user/trabajo && cd /home/user/trabajo \
  && curl -sfL '<URL_DEL_CLIP>' -o src.mp4 \
  && ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate -of json src.mp4
```

Pon las URLs entre comillas simples y usa nombres de archivo fijos. No metas texto de la persona dentro del comando.

## Subir lo que produces

Orden obligatorio, lo fija el servidor:

1. **Antes** del comando: `media_upload` con el nombre del archivo de salida. Guarda `media_id` y `upload_url`.
2. En el **mismo** comando que produce el archivo, encadena el PUT con `&&`, para que un fallo no suba un archivo viejo:

   ```bash
   cd /home/user/trabajo && ffmpeg -v error -y -ss 3 -t 10 -i src.mp4 -c copy corte.mp4 \
     && curl -f -X PUT -H 'Content-Type: video/mp4' --upload-file corte.mp4 '<upload_url>'
   ```

3. Solo si el PUT respondió 200: `media_confirm` con el `media_id` y su `type`.

El `Content-Type` debe coincidir con el archivo (`image/png`, `image/jpeg`, `video/mp4`, `application/zip`…). Nunca pases una ruta del sandbox a una herramienta de subida: solo existe el camino del PUT.

## Recetas cortas

| Tarea | Idea del comando |
|---|---|
| Recortar un tramo | `ffmpeg -ss <inicio> -t <duración> -i src.mp4 -c copy out.mp4` |
| Unir clips iguales | lista ordenada + `ffmpeg -f concat -safe 0 -i lista.txt -c copy out.mp4` |
| Sacar un fotograma | `ffmpeg -ss 1 -i src.mp4 -frames:v 1 frame.jpg` y míralo con `image_paths` |
| Devolver el audio original | `ffmpeg -i editado.mp4 -i src.mp4 -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -shortest out.mp4` |
| PNG a JPEG (TikTok) | `ffmpeg -i in.png -q:v 2 out.jpg` |

Si los clips difieren en códec, tamaño o fps, normaliza solo lo necesario antes de unir. Tras cada montaje comprueba duración, pistas, primer y último fotograma y cada unión: que el comando termine bien no prueba que el video esté bien.
