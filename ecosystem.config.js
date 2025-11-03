module.exports = {
  apps: [{
    name: 'live-stream-api',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    // Reiniciar si usa más de 500MB
    max_memory_restart: '500M',
    // Reintentos automáticos
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
