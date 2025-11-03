# 🎥 Live Stream API - RTMP a HLS

API completa en Node.js/Express para transmitir streams RTMP desde OBS Studio a través de HLS (HTTP Live Streaming) para reproducción en navegadores web.

## 📋 Características

- ✅ Servidor RTMP para recibir streams desde OBS
- ✅ Conversión automática de RTMP a HLS
- ✅ API REST con endpoints para control y monitoreo
- ✅ Reproductor web HTML5 incluido
- ✅ Estadísticas en tiempo real (bitrate, resolución, FPS)
- ✅ Sistema de logging de eventos
- ✅ CORS habilitado para acceso desde cualquier dominio
- ✅ Configuración flexible mediante variables de entorno

## 🛠️ Tecnologías

- **Express.js** - Framework web
- **Node-Media-Server** - Servidor RTMP/HLS
- **FFmpeg** - Transcodificación de video (incluido en node-media-server)
- **CORS** - Control de acceso entre dominios
- **dotenv** - Gestión de variables de entorno
- **Morgan** - Logging HTTP

## 📦 Requisitos Previos

- **Node.js** v14 o superior
- **npm** o **yarn**
- **OBS Studio** (para transmitir)
- **FFmpeg** (opcional - node-media-server incluye su propia versión)

## 🚀 Instalación

### 1. Clonar o descargar el proyecto

```bash
cd live-stream
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Copiar el archivo de ejemplo y editarlo según tus necesidades:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/Mac
cp .env.example .env
```

Editar el archivo `.env` con tu configuración:

```env
# Configuración del servidor
PORT=3000

# Configuración RTMP
RTMP_PORT=1935
STREAM_KEY=live

# Configuración HTTP para archivos de stream
HTTP_PORT=8000

# Stream key (cambia esto por seguridad)
STREAM_KEY=live
```

### 4. Iniciar el servidor

```bash
# Modo producción
npm start

# Modo desarrollo (con nodemon)
npm run dev
```

Deberías ver algo como:

```
🎥 Servidor RTMP iniciado en puerto 1935
📁 Servidor HTTP de medios en puerto 8000
📺 Stream URL: rtmp://localhost:1935/live/live
🌐 HLS URL: http://localhost:8000/live/live/index.m3u8
🚀 API REST iniciada en http://localhost:3000
📖 Documentación: http://localhost:3000

✅ ¡Servidor listo! Conecta OBS y comienza a transmitir.
```

## 🎬 Configuración de OBS Studio

### 1. Abrir OBS Studio

### 2. Ir a Configuración → Stream

- **Servicio:** Personalizado
- **Servidor:** `rtmp://localhost:1935/live`
- **Clave de retransmisión:** `live` (o el valor de STREAM_KEY en .env)

### 3. Configuración de Video (Opcional)

**Configuración → Salida:**
- **Codificador de vídeo:** x264
- **Bitrate de vídeo:** 2500 Kbps (recomendado)
- **Codificador de audio:** AAC
- **Bitrate de audio:** 128 Kbps

**Configuración → Vídeo:**
- **Resolución base:** 1920x1080
- **Resolución de salida:** 1280x720 (recomendado)
- **FPS:** 30

### 4. Iniciar transmisión

Haz clic en **"Iniciar transmisión"** en OBS.

## 🔌 API Endpoints

### Base URL
```
http://localhost:3000
```

### Endpoints disponibles

#### 1. **GET /api/stream/status**
Obtiene el estado actual del stream.

**Respuesta:**
```json
{
  "success": true,
  "message": "Stream está live",
  "data": {
    "status": "live",
    "isLive": true,
    "isPaused": false,
    "startTime": "2025-11-02T10:30:00.000Z",
    "viewers": 3
  }
}
```

#### 2. **GET /api/stream/url**
Obtiene la URL del manifest HLS para reproducción.

**Respuesta:**
```json
{
  "success": true,
  "message": "URL del stream HLS",
  "data": {
    "hlsUrl": "http://localhost:8000/live/live/index.m3u8",
    "streamKey": "live",
    "httpPort": 8000
  }
}
```

#### 3. **GET /api/stream/stats**
Obtiene estadísticas en tiempo real del stream.

**Respuesta:**
```json
{
  "success": true,
  "message": "Estadísticas del stream",
  "data": {
    "bitrate": 2500,
    "resolution": "1280x720",
    "fps": 30,
    "codec": "h264",
    "startTime": "2025-11-02T10:30:00.000Z",
    "viewers": 3,
    "uptime": 3600,
    "audio": {
      "codec": "aac",
      "samplerate": 44100,
      "channels": 2
    }
  }
}
```

#### 4. **POST /api/stream/start**
Obtiene información para iniciar el stream.

**Respuesta:**
```json
{
  "success": true,
  "message": "Servidor listo para recibir streams",
  "data": {
    "rtmpUrl": "rtmp://localhost:1935/live",
    "streamKey": "live",
    "fullUrl": "rtmp://localhost:1935/live/live",
    "instructions": "Configura OBS con esta URL y stream key"
  }
}
```

#### 5. **POST /api/stream/stop**
Detiene el stream actual.

**Respuesta:**
```json
{
  "success": true,
  "message": "Stream detenido",
  "data": {
    "stoppedAt": "2025-11-02T11:30:00.000Z"
  }
}
```

#### 6. **GET /api/info**
Obtiene información general del servidor.

**Respuesta:**
```json
{
  "success": true,
  "message": "Información del servidor",
  "data": {
    "name": "Live Stream API",
    "version": "1.0.0",
    "rtmpPort": 1935,
    "httpPort": 8000,
    "apiPort": 3000,
    "streamKey": "live",
    "rtmpUrl": "rtmp://localhost:1935/live",
    "hlsUrl": "http://localhost:8000/live/live/index.m3u8"
  }
}
```

## 📺 Reproductor Web

### Acceder al reproductor

Abre tu navegador y ve a:

```
http://localhost:3000/player.html
```

### Características del reproductor

- ✅ Reproducción automática de HLS usando HLS.js
- ✅ Controles de reproducción integrados
- ✅ Actualización automática de estadísticas cada 5 segundos
- ✅ Estado del stream en tiempo real
- ✅ Log de eventos
- ✅ Diseño responsive y moderno

### Uso del reproductor

1. **Verificar Estado:** Haz clic en "Verificar Estado" para ver si hay un stream activo
2. **Cargar Stream:** Haz clic en "Cargar Stream" para comenzar la reproducción
3. **Ver Estadísticas:** Haz clic en "Ver Estadísticas" para obtener info en tiempo real
4. **Detener Stream:** Haz clic en "Detener Stream" para finalizar la transmisión

## 💻 Ejemplos de Código

### JavaScript (Fetch API)

```javascript
// Verificar estado del stream
async function checkStatus() {
  const response = await fetch('http://localhost:3000/api/stream/status');
  const data = await response.json();
  console.log(data);
}

// Obtener URL del stream
async function getStreamUrl() {
  const response = await fetch('http://localhost:3000/api/stream/url');
  const data = await response.json();
  
  if (data.success) {
    console.log('HLS URL:', data.data.hlsUrl);
  }
}

// Obtener estadísticas
async function getStats() {
  const response = await fetch('http://localhost:3000/api/stream/stats');
  const data = await response.json();
  
  if (data.success) {
    console.log('Bitrate:', data.data.bitrate, 'Kbps');
    console.log('Resolución:', data.data.resolution);
    console.log('FPS:', data.data.fps);
  }
}

// Detener stream
async function stopStream() {
  const response = await fetch('http://localhost:3000/api/stream/stop', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  console.log(data);
}
```

### JavaScript (Axios)

```javascript
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 5000
});

// Verificar estado
const status = await api.get('/api/stream/status');
console.log(status.data);

// Detener stream
const result = await api.post('/api/stream/stop');
console.log(result.data);
```

### cURL

```bash
# Verificar estado
curl http://localhost:3000/api/stream/status

# Obtener URL
curl http://localhost:3000/api/stream/url

# Obtener estadísticas
curl http://localhost:3000/api/stream/stats

# Detener stream
curl -X POST http://localhost:3000/api/stream/stop
```

### Python

```python
import requests

API_BASE = 'http://localhost:3000'

# Verificar estado
response = requests.get(f'{API_BASE}/api/stream/status')
data = response.json()
print(data)

# Obtener estadísticas
response = requests.get(f'{API_BASE}/api/stream/stats')
stats = response.json()

if stats['success']:
    print(f"Bitrate: {stats['data']['bitrate']} Kbps")
    print(f"Resolución: {stats['data']['resolution']}")
    print(f"FPS: {stats['data']['fps']}")

# Detener stream
response = requests.post(f'{API_BASE}/api/stream/stop')
result = response.json()
print(result)
```

## 📂 Estructura del Proyecto

```
live-stream/
├── server.js              # Servidor principal
├── config.js              # Configuración centralizada
├── package.json           # Dependencias
├── .env                   # Variables de entorno (no incluir en git)
├── .env.example           # Ejemplo de variables de entorno
├── .gitignore            # Archivos ignorados por git
├── README.md             # Documentación
├── public/               # Archivos públicos
│   ├── player.html       # Reproductor web
│   └── api-examples.js   # Ejemplos de uso de la API
└── streams/              # Archivos HLS generados (auto-creado)
    └── live/             # Stream key
        └── live/         # Segmentos HLS
            ├── index.m3u8
            └── *.ts
```

## 🔧 Configuración Avanzada

### Cambiar puertos

Edita el archivo `.env`:

```env
PORT=3000          # Puerto de la API REST
RTMP_PORT=1935     # Puerto del servidor RTMP
HTTP_PORT=8000     # Puerto para servir archivos HLS
```

### Cambiar stream key

Para mayor seguridad, cambia el stream key en `.env`:

```env
STREAM_KEY=mi_clave_secreta_123
```

Luego configura OBS con:
- **Servidor:** `rtmp://localhost:1935/live`
- **Clave:** `mi_clave_secreta_123`

### Ajustar configuración de HLS

En `config.js`, puedes modificar:

```javascript
trans: {
  ffmpeg: 'ffmpeg',
  tasks: [
    {
      app: 'live',
      hls: true,
      hlsFlags: '[hls_time=3:hls_list_size=3:hls_flags=delete_segments]',
      hlsKeep: false, // true para mantener segmentos
      dash: false
    }
  ]
}
```

Parámetros de `hlsFlags`:
- `hls_time=3` - Duración de cada segmento (segundos)
- `hls_list_size=3` - Número de segmentos en la playlist
- `hls_flags=delete_segments` - Eliminar segmentos antiguos

## 🐛 Solución de Problemas

### El stream no se inicia en OBS

1. Verifica que el servidor esté ejecutándose
2. Comprueba la configuración de OBS (servidor y stream key)
3. Revisa los logs del servidor en la consola
4. Asegúrate de que el puerto 1935 no esté siendo usado por otro programa

### No se reproduce en el navegador

1. Verifica que el stream esté en vivo (endpoint `/api/stream/status`)
2. Abre la consola del navegador para ver errores
3. Comprueba que el puerto 8000 esté accesible
4. Intenta acceder directamente a la URL HLS: `http://localhost:8000/live/live/index.m3u8`

### Error de CORS

Si accedes desde otro dominio, verifica que CORS esté habilitado en `.env`:

```env
CORS_ORIGIN=*
```

O especifica dominios específicos en `config.js`:

```javascript
corsOrigin: 'http://tu-dominio.com'
```

### Bajo rendimiento

1. Reduce la resolución en OBS (ej: 1280x720)
2. Reduce el bitrate (ej: 2000 Kbps)
3. Reduce los FPS (ej: 30)
4. Verifica el uso de CPU en el servidor

## 📝 Logs y Eventos

El servidor registra automáticamente:

- ✅ Conexiones RTMP
- ✅ Inicio y fin de streams
- ✅ Conexiones de clientes
- ✅ Errores y advertencias
- ✅ Requests HTTP

Ejemplo de logs:

```
📡 [prePublish] id=123 StreamPath=/live/live
✅ Stream key válido, publicación autorizada
🎥 [postPublish] Stream iniciado - id=123
▶️  [prePlay] Cliente conectándose - id=456
🛑 [donePublish] Stream finalizado - id=123
```

## 🚀 Despliegue en Producción

### Consideraciones

1. **Usar variables de entorno seguras**
2. **Cambiar el STREAM_KEY** por uno seguro
3. **Configurar firewall** para puertos 1935, 8000, 3000
4. **Usar HTTPS** para la API (con nginx/Apache)
5. **Configurar dominio** para acceso externo
6. **Monitorear recursos** (CPU, memoria, ancho de banda)

### Ejemplo con PM2

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicación
pm2 start server.js --name live-stream-api

# Ver logs
pm2 logs live-stream-api

# Reiniciar
pm2 restart live-stream-api

# Detener
pm2 stop live-stream-api
```

## 📄 Licencia

MIT

## 👤 Autor

Tu nombre aquí

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcion`)
3. Commit tus cambios (`git commit -m 'Añadir nueva función'`)
4. Push a la rama (`git push origin feature/nueva-funcion`)
5. Abre un Pull Request

## � Deployment en Producción

Para desplegar este proyecto en un servidor de producción (DigitalOcean, AWS, etc.):

### Documentación Completa

Lee la guía completa de deployment: **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Resumen Rápido

1. **Preparar servidor**: Instalar Node.js, FFmpeg, Nginx, PM2
2. **Subir archivos**: Usa Git o SCP
3. **Configurar**: Edita `.env.production` con tus valores
4. **Iniciar**: `pm2 start ecosystem.config.js`
5. **Nginx**: Configura reverse proxy con `nginx.conf`

### Scripts de Deployment

```bash
# Linux/Mac
./deploy.sh

# Windows PowerShell
./deploy.ps1
```

### Archivos de Configuración

- `.env.production` - Variables de entorno para producción
- `ecosystem.config.js` - Configuración de PM2
- `nginx.conf` - Configuración de Nginx
- `DEPLOYMENT.md` - Guía completa paso a paso

## �📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de **Solución de Problemas**
2. Consulta **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** para errores comunes
3. Para deployment, revisa **[DEPLOYMENT.md](DEPLOYMENT.md)**
4. Consulta los logs del servidor: `pm2 logs` o `npm start`
5. Abre un issue en GitHub

---

**¡Listo para transmitir! 🎥📡**
