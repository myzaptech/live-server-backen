// ============================================
// EJEMPLO DE USO DE LA API - JAVASCRIPT
// ============================================

// Configuración base
const API_BASE_URL = 'http://localhost:3000';

// ============================================
// 1. VERIFICAR ESTADO DEL STREAM
// ============================================

async function checkStreamStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stream/status`);
    const data = await response.json();
    
    console.log('Estado del stream:', data);
    
    if (data.success) {
      console.log('- Estado:', data.data.status);
      console.log('- En vivo:', data.data.isLive);
      console.log('- Espectadores:', data.data.viewers);
    }
    
    return data;
  } catch (error) {
    console.error('Error al verificar estado:', error);
  }
}

// ============================================
// 2. OBTENER URL DEL STREAM HLS
// ============================================

async function getStreamUrl() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stream/url`);
    const data = await response.json();
    
    console.log('URL del stream:', data);
    
    if (data.success) {
      console.log('- HLS URL:', data.data.hlsUrl);
      console.log('- Stream Key:', data.data.streamKey);
      
      return data.data.hlsUrl;
    }
    
  } catch (error) {
    console.error('Error al obtener URL:', error);
  }
}

// ============================================
// 3. OBTENER ESTADÍSTICAS DEL STREAM
// ============================================

async function getStreamStats() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stream/stats`);
    const data = await response.json();
    
    console.log('Estadísticas del stream:', data);
    
    if (data.success) {
      console.log('- Bitrate:', data.data.bitrate, 'Kbps');
      console.log('- Resolución:', data.data.resolution);
      console.log('- FPS:', data.data.fps);
      console.log('- Codec:', data.data.codec);
      console.log('- Viewers:', data.data.viewers);
      console.log('- Uptime:', data.data.uptime, 'segundos');
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
  }
}

// ============================================
// 4. INICIAR STREAM (Obtener información)
// ============================================

async function startStream() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stream/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('Información para iniciar stream:', data);
    
    if (data.success) {
      console.log('- RTMP URL:', data.data.rtmpUrl);
      console.log('- Stream Key:', data.data.streamKey);
      console.log('- URL completa:', data.data.fullUrl);
      console.log('- Instrucciones:', data.data.instructions);
    }
    
    return data;
  } catch (error) {
    console.error('Error al iniciar stream:', error);
  }
}

// ============================================
// 5. DETENER STREAM
// ============================================

async function stopStream() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stream/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('Detener stream:', data);
    
    if (data.success) {
      console.log('Stream detenido en:', data.data.stoppedAt);
    }
    
    return data;
  } catch (error) {
    console.error('Error al detener stream:', error);
  }
}

// ============================================
// 6. OBTENER INFORMACIÓN DEL SERVIDOR
// ============================================

async function getServerInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/info`);
    const data = await response.json();
    
    console.log('Información del servidor:', data);
    
    if (data.success) {
      console.log('- Nombre:', data.data.name);
      console.log('- Versión:', data.data.version);
      console.log('- Puerto RTMP:', data.data.rtmpPort);
      console.log('- Puerto HTTP:', data.data.httpPort);
      console.log('- Puerto API:', data.data.apiPort);
      console.log('- RTMP URL:', data.data.rtmpUrl);
      console.log('- HLS URL:', data.data.hlsUrl);
    }
    
    return data;
  } catch (error) {
    console.error('Error al obtener información:', error);
  }
}

// ============================================
// 7. ACTUALIZACIÓN AUTOMÁTICA DE ESTADÍSTICAS
// ============================================

// Actualizar estadísticas cada 5 segundos
let statsInterval = null;

function startStatsPolling(intervalMs = 5000) {
  if (statsInterval) {
    clearInterval(statsInterval);
  }
  
  statsInterval = setInterval(async () => {
    const stats = await getStreamStats();
    
    // Aquí puedes actualizar tu UI con las estadísticas
    if (stats && stats.success) {
      console.log('📊 Estadísticas actualizadas');
    }
  }, intervalMs);
  
  console.log('✅ Polling de estadísticas iniciado');
}

function stopStatsPolling() {
  if (statsInterval) {
    clearInterval(statsInterval);
    statsInterval = null;
    console.log('🛑 Polling de estadísticas detenido');
  }
}

// ============================================
// 8. EJEMPLO DE USO COMPLETO
// ============================================

async function exampleUsage() {
  console.log('=== EJEMPLO DE USO DE LA API ===\n');
  
  // 1. Obtener información del servidor
  console.log('1️⃣ Obteniendo información del servidor...');
  await getServerInfo();
  
  await delay(1000);
  
  // 2. Verificar estado actual
  console.log('\n2️⃣ Verificando estado del stream...');
  const status = await checkStreamStatus();
  
  await delay(1000);
  
  // 3. Si está en vivo, obtener URL y estadísticas
  if (status && status.data.isLive) {
    console.log('\n3️⃣ Stream en vivo! Obteniendo detalles...');
    await getStreamUrl();
    
    await delay(1000);
    
    console.log('\n4️⃣ Obteniendo estadísticas...');
    await getStreamStats();
    
    // Iniciar polling de estadísticas
    console.log('\n5️⃣ Iniciando actualización automática...');
    startStatsPolling(5000);
    
  } else {
    console.log('\n3️⃣ Stream offline. Obteniendo información para iniciar...');
    await startStream();
  }
}

// Función auxiliar para delays
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// 9. MANEJO DE ERRORES Y REINTENTOS
// ============================================

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
      
    } catch (error) {
      console.log(`Intento ${i + 1}/${maxRetries} falló:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Esperar antes de reintentar (exponential backoff)
      await delay(Math.pow(2, i) * 1000);
    }
  }
}

// ============================================
// 10. EJEMPLO CON AXIOS (opcional)
// ============================================

// Si prefieres usar Axios en lugar de fetch:
// npm install axios

/*
const axios = require('axios');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Verificar estado con Axios
async function checkStatusWithAxios() {
  try {
    const response = await api.get('/api/stream/status');
    console.log('Estado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Detener stream con Axios
async function stopStreamWithAxios() {
  try {
    const response = await api.post('/api/stream/stop');
    console.log('Stream detenido:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
  }
}
*/

// ============================================
// EXPORTAR FUNCIONES (para Node.js)
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkStreamStatus,
    getStreamUrl,
    getStreamStats,
    startStream,
    stopStream,
    getServerInfo,
    startStatsPolling,
    stopStatsPolling,
    fetchWithRetry
  };
}

// ============================================
// EJECUTAR EJEMPLO (descomentar para probar)
// ============================================

// exampleUsage();
