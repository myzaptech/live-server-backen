/**
 * Script de diagnóstico para verificar la configuración del servidor
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('\n🔍 === DIAGNÓSTICO DEL SERVIDOR DE STREAMING ===\n');

// Verificar Node.js
console.log('📦 Versión de Node.js:', process.version);

// Verificar FFmpeg
console.log('\n🎬 Verificando FFmpeg...');
exec('ffmpeg -version', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ FFmpeg NO encontrado');
    console.log('💡 Instala FFmpeg desde: https://www.gyan.dev/ffmpeg/builds/');
  } else {
    const version = stdout.split('\n')[0];
    console.log('✅ FFmpeg encontrado:', version);
  }
  
  continueChecks();
});

function continueChecks() {
  // Verificar directorios
  console.log('\n📁 Verificando directorios...');
  
  const streamsDir = path.join(__dirname, 'streams');
  if (fs.existsSync(streamsDir)) {
    console.log('✅ Directorio streams existe');
    
    const liveDir = path.join(streamsDir, 'live');
    if (fs.existsSync(liveDir)) {
      console.log('✅ Directorio live existe');
      
      const streamDir = path.join(liveDir, 'live');
      if (fs.existsSync(streamDir)) {
        console.log('✅ Directorio de stream existe');
        
        // Listar archivos HLS
        const files = fs.readdirSync(streamDir);
        if (files.length > 0) {
          console.log('📺 Archivos HLS encontrados:', files.length);
          console.log('   Archivos:', files.join(', '));
        } else {
          console.log('⚠️  No hay archivos HLS (normal si no hay stream activo)');
        }
      } else {
        console.log('⚠️  Directorio de stream no existe (se crea al iniciar stream)');
      }
    } else {
      console.log('⚠️  Directorio live no existe');
    }
  } else {
    console.log('❌ Directorio streams no existe');
    console.log('💡 Se creará al iniciar el servidor');
  }
  
  // Verificar archivo .env
  console.log('\n⚙️  Verificando configuración...');
  const envFile = path.join(__dirname, '.env');
  if (fs.existsSync(envFile)) {
    console.log('✅ Archivo .env encontrado');
  } else {
    console.log('⚠️  Archivo .env no encontrado');
    console.log('💡 Copia .env.example a .env');
  }
  
  // Verificar dependencias
  console.log('\n📚 Verificando dependencias...');
  const packageJson = require('./package.json');
  const deps = Object.keys(packageJson.dependencies);
  
  deps.forEach(dep => {
    try {
      require.resolve(dep);
      console.log(`✅ ${dep}`);
    } catch (e) {
      console.log(`❌ ${dep} NO instalado`);
    }
  });
  
  // Verificar puertos
  console.log('\n🔌 Verificando puertos...');
  
  checkPort(3000, 'API REST');
  checkPort(8000, 'HTTP Media');
  checkPort(1935, 'RTMP');
  
  // Resumen
  setTimeout(() => {
    console.log('\n\n📋 === RESUMEN ===');
    console.log('1. Si FFmpeg está instalado: ✅');
    console.log('2. Si los directorios existen: ✅');
    console.log('3. Si hay archivo .env: ✅');
    console.log('4. Si las dependencias están instaladas: ✅');
    console.log('\n🚀 Si todo está OK, ejecuta: npm start');
    console.log('📖 Si hay problemas, revisa: TROUBLESHOOTING.md\n');
  }, 2000);
}

function checkPort(port, name) {
  const server = http.createServer();
  
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️  Puerto ${port} (${name}) está en uso`);
    } else {
      console.log(`❌ Error en puerto ${port} (${name}):`, err.code);
    }
  });
  
  server.once('listening', () => {
    console.log(`✅ Puerto ${port} (${name}) disponible`);
    server.close();
  });
  
  server.listen(port);
}
