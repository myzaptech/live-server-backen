# 📦 Archivos de Deployment - Resumen

## ✅ Archivos Creados para Deployment

Tu proyecto ahora incluye todo lo necesario para deployar en DigitalOcean u otro servidor VPS:

### 📄 Archivos de Configuración

| Archivo | Descripción | Ubicación en Servidor |
|---------|-------------|----------------------|
| `.env.production` | Variables de entorno para producción | `/var/www/live-stream/.env` |
| `ecosystem.config.js` | Configuración de PM2 | `/var/www/live-stream/` |
| `nginx.conf` | Configuración de Nginx | `/etc/nginx/sites-available/live-stream` |

### 📜 Scripts de Deployment

| Script | Plataforma | Uso |
|--------|-----------|-----|
| `deploy.sh` | Linux/Mac | `./deploy.sh` (automatiza todo) |
| `deploy.ps1` | Windows | `./deploy.ps1` (sube archivos) |

### 📚 Documentación

| Documento | Propósito |
|-----------|-----------|
| `DEPLOYMENT.md` | Guía completa paso a paso (20+ pasos) |
| `QUICK-DEPLOY.md` | Resumen rápido de comandos esenciales |
| `DEPLOYMENT-CHECKLIST.md` | Checklist para verificar cada paso |
| `README.md` | Actualizado con sección de deployment |

---

## 🎯 ¿Por Dónde Empezar?

### 1. Si es tu primera vez deployando:
📖 Lee **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía completa con explicaciones

### 2. Si tienes experiencia:
⚡ Usa **[QUICK-DEPLOY.md](QUICK-DEPLOY.md)** - Solo comandos esenciales

### 3. Para verificar que no olvidaste nada:
✅ Sigue **[DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)** - Marca cada item

---

## 🚀 Flujo de Deployment Recomendado

```
1. Leer DEPLOYMENT.md (primera vez) o QUICK-DEPLOY.md (veteranos)
   ↓
2. Preparar servidor (instalar Node.js, FFmpeg, Nginx, PM2)
   ↓
3. Editar .env.production con tu configuración
   ↓
4. Subir archivos al servidor (Git o SCP)
   ↓
5. Configurar Nginx (copiar nginx.conf)
   ↓
6. Iniciar con PM2 (pm2 start ecosystem.config.js)
   ↓
7. Configurar frontend (editar config.production.js)
   ↓
8. Verificar con DEPLOYMENT-CHECKLIST.md
   ↓
9. ¡Transmitir desde OBS! 🎉
```

---

## ⚙️ Configuración Mínima Requerida

### Antes de deployar, DEBES editar:

#### `.env` (en el servidor)
```env
DOMAIN=tu-ip-o-dominio.com    # ← CAMBIAR
STREAM_KEY=tu-clave-segura    # ← CAMBIAR
FFMPEG_PATH=/usr/bin/ffmpeg
HLS_PATH=/var/www/streams
```

#### `nginx.conf`
```nginx
server_name tu-dominio.com;   # ← CAMBIAR línea 5
```

#### `config.production.js` (frontend)
```javascript
API_BASE_URL: 'http://tu-dominio.com',     # ← CAMBIAR
MEDIA_BASE_URL: 'http://tu-dominio.com',   # ← CAMBIAR
```

---

## 🔍 Diferencias Local vs Producción

| Aspecto | Desarrollo (Local) | Producción (DigitalOcean) |
|---------|-------------------|--------------------------|
| **URLs** | localhost:3000 | tu-dominio.com |
| **Proceso** | `npm start` manual | PM2 automático |
| **Proxy** | No necesario | Nginx reverse proxy |
| **SSL** | No | Recomendado (Certbot) |
| **Firewall** | No | UFW configurado |
| **Logs** | Console | PM2 + archivos |
| **FFmpeg** | Windows path | /usr/bin/ffmpeg |
| **Config** | .env | .env.production → .env |

---

## 🛡️ Seguridad en Producción

### ✅ Checklist de Seguridad

- [ ] Cambiar STREAM_KEY por defecto
- [ ] Configurar firewall (UFW)
- [ ] Instalar SSL/HTTPS (Certbot)
- [ ] Actualizar sistema regularmente
- [ ] Hacer backups del .env
- [ ] No commitear .env al repositorio
- [ ] Usar claves SSH en lugar de contraseñas
- [ ] Configurar fail2ban (opcional)

---

## 📊 Estructura Final en Servidor

```
/var/www/
├── live-stream/                    # Backend
│   ├── server.js
│   ├── config.js
│   ├── package.json
│   ├── .env                       # Creado desde .env.production
│   ├── ecosystem.config.js
│   ├── node_modules/
│   ├── streams/                   # Archivos HLS generados
│   │   └── live/
│   │       └── live/
│   │           ├── index.m3u8
│   │           └── segment*.ts
│   └── logs/                      # Logs de PM2
│
/var/www/html/
└── live-stream-frontend/          # Frontend
    ├── index.html                 # Modificado para usar config.production.js
    ├── css/
    └── js/
        ├── config.production.js   # URLs de producción
        └── ...

/etc/nginx/
└── sites-available/
    └── live-stream               # Configuración de Nginx
```

---

## 🎓 Recursos de Ayuda

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| Backend no inicia | `pm2 logs live-stream-api` |
| OBS no conecta | Verificar puerto 1935 y firewall |
| Stream no reproduce | Verificar archivos HLS en `/var/www/streams` |
| Error 502 | Backend caído, reiniciar con PM2 |
| Frontend no carga | Verificar Nginx y permisos de archivos |

### Documentos de Referencia

1. **[DEPLOYMENT.md](DEPLOYMENT.md)** - 20+ pasos detallados
2. **[QUICK-DEPLOY.md](QUICK-DEPLOY.md)** - Comandos rápidos
3. **[DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)** - Verificación
4. **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solución de problemas
5. **[README.md](README.md)** - Documentación general

---

## 💡 Tips Pro

1. **Usa Git**: Es más fácil actualizar con `git pull`
2. **Configura SSL**: Los navegadores modernos lo prefieren
3. **Monitorea con PM2**: `pm2 monit` te muestra CPU/RAM en tiempo real
4. **Backups automáticos**: Cron job para copiar .env y código
5. **CDN para escalar**: Si tienes muchos viewers, considera un CDN
6. **Stream key único**: Cambia "live" por algo más seguro
7. **Logs rotativos**: Configura logrotate para no llenar el disco

---

## 📞 Siguiente Paso

1. **Principiantes**: Lee [DEPLOYMENT.md](DEPLOYMENT.md) completo
2. **Experimentados**: Sigue [QUICK-DEPLOY.md](QUICK-DEPLOY.md)
3. **Checkeando**: Usa [DEPLOYMENT-CHECKLIST.md](DEPLOYMENT-CHECKLIST.md)

**¿Listo para deployar? ¡Vamos! 🚀**
