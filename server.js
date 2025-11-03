const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const NodeMediaServer = require('node-media-server');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('./config');

// Crear instancia de Express
const app = express();

// Middleware
app.use(cors({ origin: config.server.corsOrigin }));
app.use(express.json());
app.use(morgan('combined')); // Logging de requests HTTP

// Estado global del stream
let streamState = {
  isLive: false,
  isPaused: false,
  stats: {
    bitrate: 0,
    resolution: 'N/A',
    fps: 0,
    codec: 'unknown',
    audio: {
      codec: 'unknown',
      samplerate: 0,
      channels: 0
    },
    startTime: null,
    viewers: 0
  },
  sessions: {}, // Almacenar información de sesiones activas
  ffmpegProcess: null // Proceso de FFmpeg para transcodificación
};

// Crear directorio para streams si no existe
const streamsDir = path.resolve(config.paths.hls);
if (!fs.existsSync(streamsDir)) {
  fs.mkdirSync(streamsDir, { recursive: true });
  console.log(`✅ Directorio de streams creado: ${streamsDir}`);
}

// Crear subdirectorio para el app 'live'
const liveDir = path.join(streamsDir, 'live');
if (!fs.existsSync(liveDir)) {
  fs.mkdirSync(liveDir, { recursive: true });
  console.log(`✅ Directorio live creado: ${liveDir}`);
}

// ==================== CONFIGURACIÓN NODE MEDIA SERVER ====================
const nmsConfig = {
  rtmp: {
    port: config.rtmp.port,
    chunk_size: config.rtmp.chunk_size,
    gop_cache: config.rtmp.gop_cache,
    ping: config.rtmp.ping,
    ping_timeout: config.rtmp.ping_timeout
  },
  http: {
    port: config.http.port,
    mediaroot: config.http.mediaroot,
    allow_origin: config.http.allow_origin
  }
  // Transcodificación deshabilitada temporalmente debido a bug en node-media-server
  // trans: config.trans
};

const nms = new NodeMediaServer(nmsConfig);

// ==================== EVENTOS DEL SERVIDOR DE MEDIOS ====================

// Evento: Nuevo stream publicado
nms.on('prePublish', (id, StreamPath, args) => {
  console.log(`📡 [prePublish] id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);
  
  // Validar stream key (seguridad básica)
  const streamKey = getStreamKeyFromPath(StreamPath);
  
  if (streamKey !== config.streamKey) {
    console.log(`❌ Stream key inválido: ${streamKey}`);
    // Aquí podrías rechazar la conexión si lo implementas
    return;
  }
  
  console.log(`✅ Stream key válido, publicación autorizada`);
});

// Evento: Stream iniciado
nms.on('postPublish', (id, StreamPath, args) => {
  console.log(`🎥 [postPublish] Stream iniciado - id=${id} StreamPath=${StreamPath}`);
  
  streamState.isLive = true;
  streamState.isPaused = false;
  streamState.stats.startTime = new Date().toISOString();
  
  // Almacenar información de la sesión
  streamState.sessions[id] = {
    id,
    StreamPath,
    startTime: new Date(),
    args
  };
  
  // Iniciar transcodificación a HLS con FFmpeg
  startFFmpegTranscoding(StreamPath);
});

// Evento: Stream finalizado
nms.on('donePublish', (id, StreamPath, args) => {
  console.log(`🛑 [donePublish] Stream finalizado - id=${id} StreamPath=${StreamPath}`);
  
  streamState.isLive = false;
  streamState.isPaused = false;
  streamState.stats.startTime = null;
  
  // Eliminar sesión
  delete streamState.sessions[id];
  
  // Detener FFmpeg
  stopFFmpegTranscoding();
  
  // Limpiar archivos HLS antiguos
  cleanupHLSFiles(StreamPath);
});

// Evento: Cliente conectado para reproducir
nms.on('prePlay', (id, StreamPath, args) => {
  console.log(`▶️  [prePlay] Cliente conectándose - id=${id} StreamPath=${StreamPath}`);
  streamState.stats.viewers++;
});

// Evento: Cliente desconectado
nms.on('donePlay', (id, StreamPath, args) => {
  console.log(`⏹️  [donePlay] Cliente desconectado - id=${id} StreamPath=${StreamPath}`);
  streamState.stats.viewers = Math.max(0, streamState.stats.viewers - 1);
});

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Inicia la transcodificación de RTMP a HLS usando FFmpeg
 */
function startFFmpegTranscoding(StreamPath) {
  const streamKey = getStreamKeyFromPath(StreamPath);
  const rtmpUrl = `rtmp://localhost:${config.rtmp.port}${StreamPath}`;
  const hlsPath = path.join(streamsDir, 'live', streamKey);
  
  // Crear directorio HLS si no existe
  if (!fs.existsSync(hlsPath)) {
    fs.mkdirSync(hlsPath, { recursive: true });
  }
  
  const hlsFile = path.join(hlsPath, 'index.m3u8');
  
  console.log(`🎬 Iniciando FFmpeg para transcodificación HLS...`);
  console.log(`📥 Input: ${rtmpUrl}`);
  console.log(`📤 Output: ${hlsFile}`);
  
  const ffmpegPath = config.trans.ffmpeg;
  
  const ffmpegArgs = [
    '-i', rtmpUrl,
    '-c:v', 'copy',           // Copiar codec de video (sin recodificar)
    '-c:a', 'aac',            // Codec de audio AAC
    '-b:a', '128k',           // Bitrate de audio
    '-f', 'hls',              // Formato HLS
    '-hls_time', '2',         // Duración de cada segmento (2 segundos)
    '-hls_list_size', '3',    // Número de segmentos en playlist
    '-hls_flags', 'delete_segments', // Eliminar segmentos antiguos
    '-hls_segment_filename', path.join(hlsPath, 'segment%03d.ts'),
    hlsFile
  ];
  
  streamState.ffmpegProcess = spawn(ffmpegPath, ffmpegArgs);
  
  streamState.ffmpegProcess.on('error', (err) => {
    console.error(`❌ Error al iniciar FFmpeg: ${err.message}`);
  });
  
  streamState.ffmpegProcess.stdout.on('data', (data) => {
    // FFmpeg envía su output a stderr, no a stdout
  });
  
  streamState.ffmpegProcess.stderr.on('data', (data) => {
    const output = data.toString();
    
    // Parsear información del stream de video
    const videoMatch = output.match(/Stream #\d+:\d+.*Video: (\w+).*?(\d+)x(\d+).*?(\d+(?:\.\d+)?)\s*fps/);
    if (videoMatch) {
      streamState.stats.codec = videoMatch[1];
      streamState.stats.resolution = `${videoMatch[2]}x${videoMatch[3]}`;
      streamState.stats.fps = parseFloat(videoMatch[4]);
    }
    
    // Parsear información del audio
    const audioMatch = output.match(/Stream #\d+:\d+.*Audio: (\w+), (\d+) Hz, (\w+)/);
    if (audioMatch) {
      streamState.stats.audio = {
        codec: audioMatch[1],
        samplerate: parseInt(audioMatch[2]),
        channels: audioMatch[3] === 'stereo' ? 2 : 1
      };
    }
    
    // Parsear bitrate del progreso
    const bitrateMatch = output.match(/bitrate=\s*(\d+(?:\.\d+)?)\s*kbits\/s/);
    if (bitrateMatch) {
      streamState.stats.bitrate = Math.round(parseFloat(bitrateMatch[1]));
    }
    
    if (output.includes('frame=')) {
      // Log de progreso (opcional, comentar si hay mucho output)
      // console.log(`FFmpeg: ${output.trim()}`);
    }
  });
  
  streamState.ffmpegProcess.on('close', (code) => {
    console.log(`🛑 FFmpeg finalizado con código: ${code}`);
    streamState.ffmpegProcess = null;
  });
  
  console.log(`✅ FFmpeg iniciado correctamente`);
}

/**
 * Detiene la transcodificación de FFmpeg
 */
function stopFFmpegTranscoding() {
  if (streamState.ffmpegProcess) {
    console.log(`🛑 Deteniendo FFmpeg...`);
    streamState.ffmpegProcess.kill('SIGTERM');
    streamState.ffmpegProcess = null;
  }
}

/**
 * Extrae el stream key del path
 * Ejemplo: /live/mi_stream_key -> mi_stream_key
 */
function getStreamKeyFromPath(streamPath) {
  const parts = streamPath.split('/');
  return parts[parts.length - 1];
}

/**
 * Limpia archivos HLS antiguos
 */
function cleanupHLSFiles(streamPath) {
  const streamKey = getStreamKeyFromPath(streamPath);
  const hlsDir = path.join(streamsDir, 'live', streamKey);
  
  if (fs.existsSync(hlsDir)) {
    try {
      fs.rmSync(hlsDir, { recursive: true, force: true });
      console.log(`🗑️  Archivos HLS limpiados: ${hlsDir}`);
    } catch (error) {
      console.error(`❌ Error al limpiar archivos HLS: ${error.message}`);
    }
  }
}

/**
 * Obtiene estadísticas del stream desde el servidor de medios
 */
function getStreamStats(streamKey = config.streamKey) {
  // Con manual FFmpeg transcoding, retornamos las stats del estado
  if (streamState.isLive && streamState.stats) {
    return streamState.stats;
  }
  
  // Si no hay stream activo, retornar valores por defecto
  return {
    bitrate: 0,
    resolution: 'N/A',
    fps: 0,
    codec: 'unknown',
    audio: {
      codec: 'unknown',
      samplerate: 0,
      channels: 0
    }
  };
}

// ==================== ENDPOINTS DE LA API ====================

/**
 * GET /api/stream/status
 * Devuelve el estado actual del stream
 */
app.get('/api/stream/status', (req, res) => {
  const status = streamState.isLive ? 'live' : streamState.isPaused ? 'paused' : 'offline';
  
  res.json({
    success: true,
    message: `Stream está ${status}`,
    data: {
      status,
      isLive: streamState.isLive,
      isPaused: streamState.isPaused,
      startTime: streamState.stats.startTime,
      viewers: streamState.stats.viewers
    }
  });
});

/**
 * GET /api/stream/url
 * Devuelve la URL del manifest HLS (.m3u8)
 */
app.get('/api/stream/url', (req, res) => {
  if (!streamState.isLive) {
    return res.json({
      success: false,
      message: 'Stream no está en vivo',
      data: null
    });
  }
  
  const streamKey = config.streamKey;
  const hlsUrl = `http://localhost:${config.http.port}/live/${streamKey}/index.m3u8`;
  
  res.json({
    success: true,
    message: 'URL del stream HLS',
    data: {
      hlsUrl,
      streamKey,
      httpPort: config.http.port
    }
  });
});

/**
 * GET /api/stream/stats
 * Devuelve estadísticas del stream
 */
app.get('/api/stream/stats', (req, res) => {
  if (!streamState.isLive) {
    return res.json({
      success: false,
      message: 'Stream no está en vivo',
      data: null
    });
  }
  
  const stats = getStreamStats();
  
  res.json({
    success: true,
    message: 'Estadísticas del stream',
    data: {
      ...stats,
      startTime: streamState.stats.startTime,
      viewers: streamState.stats.viewers,
      uptime: streamState.stats.startTime 
        ? Math.round((Date.now() - new Date(streamState.stats.startTime).getTime()) / 1000) 
        : 0
    }
  });
});

/**
 * POST /api/stream/start
 * Inicia la captura del stream (placeholder - OBS inicia automáticamente)
 */
app.post('/api/stream/start', (req, res) => {
  // Nota: En realidad, OBS inicia el stream al conectarse
  // Este endpoint es más informativo o podría usarse para pre-configuración
  
  res.json({
    success: true,
    message: 'Servidor listo para recibir streams',
    data: {
      rtmpUrl: `rtmp://localhost:${config.rtmp.port}/live`,
      streamKey: config.streamKey,
      fullUrl: `rtmp://localhost:${config.rtmp.port}/live/${config.streamKey}`,
      instructions: 'Configura OBS con esta URL y stream key'
    }
  });
});

/**
 * POST /api/stream/stop
 * Detiene el stream (fuerza desconexión si es necesario)
 */
app.post('/api/stream/stop', (req, res) => {
  if (!streamState.isLive) {
    return res.json({
      success: false,
      message: 'No hay stream activo',
      data: null
    });
  }
  
  // Forzar cierre de todas las sesiones activas
  Object.keys(streamState.sessions).forEach(id => {
    const session = nms.nrs.sessions.get(id);
    if (session) {
      session.reject();
    }
  });
  
  streamState.isLive = false;
  streamState.sessions = {};
  
  res.json({
    success: true,
    message: 'Stream detenido',
    data: {
      stoppedAt: new Date().toISOString()
    }
  });
});

/**
 * GET /api/info
 * Información general del servidor
 */
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    message: 'Información del servidor',
    data: {
      name: 'Live Stream API',
      version: '1.0.0',
      rtmpPort: config.rtmp.port,
      httpPort: config.http.port,
      apiPort: config.server.port,
      streamKey: config.streamKey,
      rtmpUrl: `rtmp://localhost:${config.rtmp.port}/live`,
      hlsUrl: `http://localhost:${config.http.port}/live/${config.streamKey}/index.m3u8`
    }
  });
});

/**
 * GET /
 * Página de inicio con información básica
 */
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Live Stream API</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          max-width: 800px; 
          margin: 50px auto; 
          padding: 20px;
          background: #f5f5f5;
        }
        .container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        .endpoint { 
          background: #f8f8f8; 
          padding: 10px; 
          margin: 10px 0; 
          border-left: 4px solid #007bff;
          font-family: monospace;
        }
        .info { color: #666; margin: 10px 0; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎥 Live Stream API</h1>
        <p class="info">Servidor RTMP a HLS activo y funcionando</p>
        
        <h2>📡 Configuración de OBS</h2>
        <div class="endpoint">
          <strong>Servidor:</strong> rtmp://localhost:${config.rtmp.port}/live<br>
          <strong>Stream Key:</strong> ${config.streamKey}
        </div>
        
        <h2>🔌 Endpoints API</h2>
        <div class="endpoint">GET /api/stream/status - Estado del stream</div>
        <div class="endpoint">GET /api/stream/url - URL del manifest HLS</div>
        <div class="endpoint">GET /api/stream/stats - Estadísticas del stream</div>
        <div class="endpoint">POST /api/stream/start - Información para iniciar</div>
        <div class="endpoint">POST /api/stream/stop - Detener stream</div>
        <div class="endpoint">GET /api/info - Información del servidor</div>
        
        <h2>📺 Reproductor</h2>
        <p><a href="/player.html">Abrir reproductor de ejemplo</a></p>
      </div>
    </body>
    </html>
  `);
});

// Servir archivos estáticos (para el reproductor HTML)
app.use(express.static(path.join(__dirname, 'public')));

// ==================== MANEJO DE ERRORES ====================

// Error 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    data: null
  });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    data: {
      error: config.server.env === 'development' ? err.message : 'Error desconocido'
    }
  });
});

// ==================== INICIAR SERVIDORES ====================

// Iniciar Node Media Server (RTMP + HLS)
nms.run();
console.log(`🎥 Servidor RTMP iniciado en puerto ${config.rtmp.port}`);
console.log(`📁 Servidor HTTP de medios en puerto ${config.http.port}`);
console.log(`📺 Stream URL: rtmp://localhost:${config.rtmp.port}/live/${config.streamKey}`);
console.log(`🌐 HLS URL: http://localhost:${config.http.port}/live/${config.streamKey}/index.m3u8`);

// Iniciar servidor API REST
app.listen(config.server.port, () => {
  console.log(`🚀 API REST iniciada en http://localhost:${config.server.port}`);
  console.log(`📖 Documentación: http://localhost:${config.server.port}`);
  console.log(`\n✅ ¡Servidor listo! Conecta OBS y comienza a transmitir.\n`);
});

// Manejo de cierre graceful
process.on('SIGINT', () => {
  console.log('\n🛑 Cerrando servidor...');
  nms.stop();
  process.exit(0);
});
