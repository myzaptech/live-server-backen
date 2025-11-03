require('dotenv').config();

module.exports = {
  // Configuración del servidor API
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    domain: process.env.DOMAIN || 'localhost',
    protocol: process.env.NODE_ENV === 'production' ? 'https' : 'http'
  },

  // Configuración del servidor RTMP y HLS
  rtmp: {
    port: parseInt(process.env.RTMP_PORT) || 1935,
    chunk_size: parseInt(process.env.RTMP_CHUNK_SIZE) || 60000,
    gop_cache: process.env.RTMP_GOP_CACHE === 'true',
    ping: parseInt(process.env.RTMP_PING) || 30,
    ping_timeout: parseInt(process.env.RTMP_PING_TIMEOUT) || 60
  },

  // Configuración HTTP para servir archivos HLS
  http: {
    port: parseInt(process.env.HTTP_PORT) || 8000,
    mediaroot: process.env.HTTP_MEDIA_ROOT || './streams',
    allow_origin: '*'
  },

  // Configuración de transcodificación HLS
  trans: {
    ffmpeg: process.env.FFMPEG_PATH || 'C:/ProgramData/chocolatey/bin/ffmpeg.exe',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
        dash: false
      }
    ]
  },

  // Stream key para seguridad básica
  streamKey: process.env.STREAM_KEY || 'live',

  // Configuración de paths
  paths: {
    hls: process.env.HLS_PATH || './streams'
  }
};
