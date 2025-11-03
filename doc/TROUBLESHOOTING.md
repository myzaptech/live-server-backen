# 🔧 Guía de Troubleshooting - Error 404 HLS

## Problema: Error 404 al cargar index.m3u8

```
GET http://localhost:8000/live/live/index.m3u8 404 (Not Found)
```

Este error ocurre cuando los archivos HLS no se están generando correctamente.

## ✅ Soluciones

### 1. Verificar que FFmpeg está instalado

```powershell
# Verificar instalación de FFmpeg
ffmpeg -version
```

**Si no está instalado:**

#### Windows:
1. Descarga FFmpeg desde: https://www.gyan.dev/ffmpeg/builds/
2. Extrae el archivo en `C:\ffmpeg`
3. Agrega a PATH: `C:\ffmpeg\bin`
4. Reinicia PowerShell y verifica: `ffmpeg -version`

#### Con Chocolatey:
```powershell
choco install ffmpeg
```

#### Con Scoop:
```powershell
scoop install ffmpeg
```

### 2. Reiniciar el servidor

```powershell
# Detener servidor (Ctrl+C)
# Luego reiniciar
npm start
```

### 3. Verificar directorios

```powershell
# Debe existir la estructura:
# live-stream/
# └── streams/
#     └── live/
#         └── live/  (se crea cuando OBS conecta)
#             ├── index.m3u8
#             └── *.ts

# Verificar que el directorio existe
ls streams
```

### 4. Configurar OBS correctamente

**Configuración → Stream:**
- ✅ Servicio: `Personalizado`
- ✅ Servidor: `rtmp://localhost:1935/live`
- ✅ Clave: `live`

**IMPORTANTE:** Asegúrate de hacer clic en **"Iniciar transmisión"** en OBS antes de intentar cargar el stream en el navegador.

### 5. Verificar el log del servidor

Cuando OBS se conecta, debes ver algo como:

```
📡 [prePublish] id=... StreamPath=/live/live
✅ Stream key válido, publicación autorizada
🎥 [postPublish] Stream iniciado - id=...
```

Si no ves estos mensajes, OBS no se está conectando correctamente.

### 6. Probar manualmente la URL HLS

Una vez que OBS esté transmitiendo, prueba la URL directamente:

```
http://localhost:8000/live/live/index.m3u8
```

Debería devolver un archivo de texto con el contenido del manifest HLS.

### 7. Verificar puertos

```powershell
# Verificar que los puertos no estén ocupados
netstat -ano | findstr "1935"  # RTMP
netstat -ano | findstr "8000"  # HTTP Media
netstat -ano | findstr "3000"  # API
```

### 8. Limpiar archivos temporales

```powershell
# Detener servidor
# Eliminar archivos antiguos
Remove-Item -Path "streams\*" -Recurse -Force

# Reiniciar servidor
npm start
```

### 9. Configuración alternativa (sin transcodificación)

Si FFmpeg sigue dando problemas, edita `config.js`:

```javascript
trans: {
  ffmpeg: 'C:\\ruta\\completa\\a\\ffmpeg.exe',  // Ruta absoluta
  tasks: [
    {
      app: 'live',
      hls: true,
      hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
      dash: false
    }
  ]
}
```

### 10. Usar archivos HLS pregenerados (modo desarrollo)

Si solo quieres probar el frontend sin OBS, puedes usar un stream de prueba:

Edita `js/config.js` en el frontend:

```javascript
// Stream de prueba público
CONFIG.HLS_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';
```

## 🔍 Diagnóstico paso a paso

### Paso 1: Verificar servidor backend
```powershell
cd p:\JS\live-stream
npm start
```

Debe mostrar:
```
🎥 Servidor RTMP iniciado en puerto 1935
📁 Servidor HTTP de medios en puerto 8000
🚀 API REST iniciada en http://localhost:3000
```

### Paso 2: Verificar OBS
1. Abre OBS
2. Configuración → Stream
3. Verifica servidor y clave
4. Haz clic en "Iniciar transmisión"
5. Debe aparecer "EN VIVO" en rojo

### Paso 3: Verificar archivos HLS
```powershell
# Espera 3-5 segundos después de iniciar OBS
ls streams\live\live

# Debes ver:
# index.m3u8
# varios archivos .ts
```

### Paso 4: Probar en navegador
1. Abre `http://localhost:8080` (frontend)
2. Haz clic en "Cargar Stream"
3. Debería reproducirse el video

## 📊 Tabla de diagnóstico

| Síntoma | Causa probable | Solución |
|---------|----------------|----------|
| 404 en index.m3u8 | FFmpeg no instalado | Instalar FFmpeg |
| No aparece "postPublish" | OBS no conectado | Verificar config OBS |
| Archivos .ts no se crean | FFmpeg mal configurado | Ruta absoluta en config |
| Stream se corta | Bitrate muy alto | Reducir en OBS |
| Lag/buffering | Red lenta | Reducir resolución |

## 💡 Consejos adicionales

1. **Usa una resolución moderada en OBS**: 1280x720 @ 30fps funciona bien
2. **Bitrate recomendado**: 2000-2500 Kbps
3. **Verifica tu firewall**: Debe permitir puertos 1935, 8000, 3000
4. **Usa conexión por cable**: WiFi puede causar problemas
5. **Cierra programas pesados**: OBS + streaming consume recursos

## 🆘 Si nada funciona

1. Reinicia el sistema
2. Reinstala FFmpeg
3. Clona el proyecto de nuevo
4. Verifica que Node.js esté actualizado: `node -v` (debe ser v14+)
5. Revisa los logs completos del servidor en la consola

## 📞 Soporte

Si el problema persiste:
1. Copia todos los logs del servidor
2. Copia los logs del navegador (F12 → Console)
3. Incluye tu versión de:
   - Node.js: `node -v`
   - NPM: `npm -v`
   - FFmpeg: `ffmpeg -version`
   - Sistema operativo

---

**¡No te rindas! El streaming puede ser complicado al inicio, pero una vez configurado funciona perfectamente.** 🚀
