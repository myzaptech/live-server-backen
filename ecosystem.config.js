module.exports = {
  apps: [
    {
      name: 'live-stream-api',
      script: './server.js',
      
      // Instancias (usa cluster mode para mejor rendimiento)
      instances: 1, // Cambia a 'max' para usar todos los CPUs disponibles
      exec_mode: 'fork', // Usa 'cluster' si pones instances > 1
      
      // Variables de entorno
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
        MEDIA_PORT: 8000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        MEDIA_PORT: 8000
      },
      
      // Reinicio automático
      watch: false, // No usar watch en producción
      ignore_watch: ['node_modules', 'streams', 'logs'],
      watch_options: {
        followSymlinks: false
      },
      
      // Gestión de errores
      max_memory_restart: '500M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 4000,
      
      // Logging
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_file: './logs/pm2-combined.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Auto-restart
      autorestart: true,
      
      // Merge logs
      merge_logs: true,
      
      // Kill timeout
      kill_timeout: 5000,
      listen_timeout: 3000,
      
      // Source map support
      source_map_support: true,
    }
  ],

  // Configuración de deploy (opcional)
  deploy: {
    production: {
      user: 'root',
      host: 'tu-servidor.com', // Cambia por tu IP o dominio
      ref: 'origin/main',
      repo: 'git@github.com:tu-usuario/live-stream.git', // Tu repositorio
      path: '/var/www/live-stream',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt-get update && apt-get install -y git nodejs npm ffmpeg'
    }
  }
};