# ✅ Checklist de Deployment

Usa este checklist para asegurarte de que todo esté configurado correctamente.

## 📋 Pre-Deployment

- [ ] Tienes acceso SSH a tu droplet de DigitalOcean
- [ ] Conoces la IP o dominio de tu servidor
- [ ] Tienes el proyecto listo en tu máquina local
- [ ] Has leído [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🔧 Instalación en Servidor

### Sistema Base
- [ ] Node.js v18+ instalado
- [ ] FFmpeg instalado
- [ ] Nginx instalado
- [ ] PM2 instalado globalmente
- [ ] Git instalado (si usarás Git)

### Directorios
- [ ] `/var/www/live-stream` creado
- [ ] `/var/www/html/live-stream-frontend` creado
- [ ] `/var/www/streams/live` creado con permisos 755
- [ ] `/var/www/live-stream/logs` creado

---

## ⚙️ Configuración Backend

- [ ] Archivos del proyecto copiados a `/var/www/live-stream`
- [ ] `npm install --production` ejecutado sin errores
- [ ] `.env` creado y editado con valores correctos:
  - [ ] `DOMAIN` configurado
  - [ ] `STREAM_KEY` configurado (cambiar del default)
  - [ ] `FFMPEG_PATH=/usr/bin/ffmpeg`
  - [ ] `HLS_PATH=/var/www/streams`
  - [ ] `NODE_ENV=production`
- [ ] `ecosystem.config.js` presente
- [ ] PM2 iniciado: `pm2 start ecosystem.config.js`
- [ ] PM2 guardado: `pm2 save`
- [ ] PM2 startup configurado: `pm2 startup`
- [ ] Backend responde: `curl http://localhost:3000/api/stream/status`

---

## 🌐 Configuración Nginx

- [ ] `nginx.conf` copiado a `/etc/nginx/sites-available/live-stream`
- [ ] `server_name` editado en nginx.conf
- [ ] Symlink creado: `/etc/nginx/sites-enabled/live-stream`
- [ ] Configuración válida: `nginx -t` sin errores
- [ ] Nginx reiniciado: `systemctl restart nginx`
- [ ] API accesible externamente: `http://tu-ip/api/stream/status`

---

## 🎨 Configuración Frontend

- [ ] Archivos copiados a `/var/www/html/live-stream-frontend`
- [ ] `index.html` usa `config.production.js` en lugar de `config.js`
- [ ] `config.production.js` editado con el dominio/IP correcto
- [ ] Permisos establecidos: `chmod -R 755`
- [ ] Owner correcto: `chown -R www-data:www-data`
- [ ] Frontend accesible: `http://tu-ip/`

---

## 🔒 Seguridad y Firewall

- [ ] UFW habilitado
- [ ] Puerto 22 (SSH) abierto
- [ ] Puerto 80 (HTTP) abierto
- [ ] Puerto 443 (HTTPS) abierto (si usas SSL)
- [ ] Puerto 1935 (RTMP) abierto
- [ ] STREAM_KEY cambiado del valor por defecto
- [ ] Backups configurados

---

## 🧪 Pruebas

### Backend
- [ ] `pm2 status` muestra la app online
- [ ] `pm2 logs` no muestra errores críticos
- [ ] API `/api/stream/status` responde
- [ ] API `/api/stream/url` responde
- [ ] API `/api/stream/stats` responde

### Nginx
- [ ] Frontend carga en el navegador
- [ ] No hay errores 502/504
- [ ] Archivos estáticos se sirven correctamente

### RTMP
- [ ] Puerto 1935 está escuchando: `netstat -tulpn | grep 1935`
- [ ] OBS puede conectarse sin errores
- [ ] Stream se recibe en el servidor

### HLS
- [ ] Archivos `.m3u8` y `.ts` se generan en `/var/www/streams/live/live/`
- [ ] Archivos HLS son accesibles: `http://tu-ip/live/live/index.m3u8`
- [ ] El reproductor web carga el stream

---

## 📺 Configuración OBS

- [ ] Servidor: `rtmp://tu-ip/live` configurado
- [ ] Stream Key configurado correctamente
- [ ] Codec de video: H264
- [ ] Codec de audio: AAC
- [ ] "Iniciar transmisión" funciona sin errores

---

## 🎯 Verificación Final

- [ ] Frontend carga en: `http://tu-ip/`
- [ ] API responde en: `http://tu-ip/api/stream/status`
- [ ] OBS conecta a: `rtmp://tu-ip/live`
- [ ] Stream se reproduce en el navegador
- [ ] Estadísticas se actualizan en tiempo real
- [ ] No hay errores en `pm2 logs`
- [ ] No hay errores en `/var/log/nginx/error.log`

---

## 🔄 Post-Deployment

- [ ] PM2 configurado para reinicio automático
- [ ] Sistema de backups implementado
- [ ] Monitoreo configurado (opcional)
- [ ] SSL/HTTPS configurado (recomendado)
- [ ] Documentación actualizada con URLs reales

---

## 🎉 ¡Listo!

Si todos los checks están marcados, ¡tu sistema de streaming está completamente funcional!

### 📚 Recursos Adicionales

- **Deployment completo**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **Guía rápida**: [QUICK-DEPLOY.md](QUICK-DEPLOY.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **README principal**: [README.md](README.md)

### 🐛 Si algo falla

1. Revisa los logs: `pm2 logs` y `tail -f /var/log/nginx/error.log`
2. Verifica puertos: `netstat -tulpn | grep -E '1935|3000|8000'`
3. Consulta [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
4. Revisa la configuración de firewall: `ufw status`

---

**¡Feliz streaming! 🎥🚀**
