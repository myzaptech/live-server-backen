# 🚀 Guía de Deployment en DigitalOcean

Esta guía te ayudará a desplegar tu sistema de streaming RTMP a HLS en un droplet de DigitalOcean.

## 📋 Requisitos Previos

- Un droplet de DigitalOcean (Ubuntu 20.04 LTS o superior)
- Acceso SSH al servidor
- Dominio configurado (opcional, puedes usar la IP)
- Node.js 18+ instalado en el servidor

---

## 🔧 Paso 1: Preparar el Servidor

### 1.1 Conectarse al Droplet

```bash
ssh root@tu-ip-del-droplet
```

### 1.2 Actualizar el Sistema

```bash
apt update && apt upgrade -y
```

### 1.3 Instalar Dependencias

```bash
# Node.js y npm
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# FFmpeg
apt install -y ffmpeg

# Nginx
apt install -y nginx

# PM2 (Process Manager)
npm install -g pm2

# Git (si vas a clonar desde GitHub)
apt install -y git
```

### 1.4 Verificar Instalaciones

```bash
node --version    # Debe mostrar v18.x o superior
npm --version
ffmpeg -version
nginx -v
pm2 --version
```

---

## 📦 Paso 2: Subir el Proyecto al Servidor

### Opción A: Usando Git (Recomendado)

```bash
# En tu máquina local
cd p:\JS\live-stream
git init
git add .
git commit -m "Initial commit"
git remote add origin tu-repo-github.git
git push -u origin main

# En el servidor
cd /var/www
git clone tu-repo-github.git live-stream
cd live-stream
npm install --production
```

### Opción B: Usando SCP/SFTP

```powershell
# Desde tu máquina local (PowerShell)
# Backend
scp -r p:\JS\live-stream root@tu-ip:/var/www/

# Frontend
scp -r p:\JS\live-stream-frontend root@tu-ip:/var/www/html/
```

---

## ⚙️ Paso 3: Configurar el Backend

### 3.1 Crear Directorios Necesarios

```bash
cd /var/www/live-stream

# Crear directorio para streams HLS
mkdir -p /var/www/streams/live
chmod -R 755 /var/www/streams

# Crear directorio para logs
mkdir -p logs
```

### 3.2 Configurar Variables de Entorno

```bash
# Copiar el archivo de producción
cp .env.production .env

# Editar con tus valores
nano .env
```

Configura estos valores en `.env`:

```env
PORT=3000
RTMP_PORT=1935
HTTP_MEDIA_PORT=8000
DOMAIN=tu-dominio.com   # O tu IP: 192.168.1.100
STREAM_KEY=live
FFMPEG_PATH=/usr/bin/ffmpeg
HLS_PATH=/var/www/streams
CORS_ORIGIN=*
NODE_ENV=production
```

### 3.3 Instalar Dependencias

```bash
npm install --production
```

---

## 🌐 Paso 4: Configurar Nginx

### 4.1 Copiar Configuración

```bash
cp nginx.conf /etc/nginx/sites-available/live-stream
```

### 4.2 Editar Configuración

```bash
nano /etc/nginx/sites-available/live-stream
```

Cambia `server_name tu-dominio.com;` por tu dominio o IP.

### 4.3 Activar el Sitio

```bash
# Crear symlink
ln -s /etc/nginx/sites-available/live-stream /etc/nginx/sites-enabled/

# Desactivar sitio por defecto (opcional)
rm /etc/nginx/sites-enabled/default

# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

---

## 🚀 Paso 5: Iniciar el Backend con PM2

### 5.1 Iniciar la Aplicación

```bash
cd /var/www/live-stream
pm2 start ecosystem.config.js
```

### 5.2 Configurar PM2 para Inicio Automático

```bash
# Guardar configuración actual
pm2 save

# Configurar inicio automático
pm2 startup

# Ejecuta el comando que PM2 te muestre
```

### 5.3 Comandos Útiles de PM2

```bash
pm2 status              # Ver estado
pm2 logs live-stream-api  # Ver logs en tiempo real
pm2 restart live-stream-api  # Reiniciar
pm2 stop live-stream-api     # Detener
pm2 delete live-stream-api   # Eliminar
```

---

## 🎨 Paso 6: Configurar el Frontend

### 6.1 Copiar Frontend

```bash
# Si no lo hiciste antes
cp -r /var/www/live-stream-frontend /var/www/html/live-stream-frontend
```

### 6.2 Actualizar Configuración

```bash
cd /var/www/html/live-stream-frontend
nano index.html
```

Cambia la línea del config.js:

```html
<!-- Cambiar esto -->
<script src="js/config.js"></script>

<!-- Por esto -->
<script src="js/config.production.js"></script>
```

### 6.3 Editar URLs en config.production.js

```bash
nano js/config.production.js
```

Actualiza las URLs:

```javascript
API_BASE_URL: 'http://tu-dominio.com',  // Tu dominio o IP
MEDIA_BASE_URL: 'http://tu-dominio.com',
```

### 6.4 Dar Permisos

```bash
chmod -R 755 /var/www/html/live-stream-frontend
chown -R www-data:www-data /var/www/html/live-stream-frontend
```

---

## 🔥 Paso 7: Configurar Firewall

```bash
# Permitir puertos necesarios
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS (si usas SSL)
ufw allow 1935/tcp    # RTMP
ufw allow 8000/tcp    # HTTP Media (opcional si usas Nginx)

# Activar firewall
ufw enable

# Verificar
ufw status
```

---

## 📺 Paso 8: Configurar OBS

En OBS Studio:

1. **Configuración → Stream**
2. **Servicio:** Personalizado
3. **Servidor:** `rtmp://tu-dominio.com/live` o `rtmp://tu-ip/live`
4. **Stream Key:** `live` (o el que configuraste en .env)

---

## 🧪 Paso 9: Probar el Sistema

### 9.1 Verificar Backend

```bash
# Ver logs
pm2 logs live-stream-api

# Probar API
curl http://localhost:3000/api/stream/status
```

### 9.2 Verificar Frontend

Abre en tu navegador:
```
http://tu-dominio.com/
```

### 9.3 Iniciar Stream

1. Abre OBS
2. Configura el servidor RTMP
3. Haz clic en "Iniciar transmisión"
4. En el frontend, haz clic en "Cargar Stream"

---

## 🔒 Paso 10: Configurar SSL (Opcional pero Recomendado)

### 10.1 Instalar Certbot

```bash
apt install -y certbot python3-certbot-nginx
```

### 10.2 Obtener Certificado SSL

```bash
certbot --nginx -d tu-dominio.com
```

### 10.3 Actualizar URLs en Frontend

Cambia `http://` por `https://` en `config.production.js`.

---

## 📊 Monitoreo y Mantenimiento

### Ver Logs

```bash
# Backend
pm2 logs live-stream-api

# Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Actualizar Proyecto

```bash
cd /var/www/live-stream
git pull origin main
npm install --production
pm2 restart live-stream-api
```

### Backup

```bash
# Backup del proyecto
tar -czf live-stream-backup-$(date +%Y%m%d).tar.gz /var/www/live-stream

# Backup de configuración
cp .env .env.backup
```

---

## 🐛 Troubleshooting

### El backend no inicia

```bash
# Verificar logs
pm2 logs live-stream-api

# Verificar que el puerto no esté en uso
netstat -tulpn | grep 3000
```

### No puedo conectar desde OBS

```bash
# Verificar que el puerto RTMP esté abierto
netstat -tulpn | grep 1935

# Verificar firewall
ufw status
```

### El stream no se reproduce

```bash
# Verificar que FFmpeg esté corriendo
ps aux | grep ffmpeg

# Verificar archivos HLS
ls -la /var/www/streams/live/live/
```

### Error 502 Bad Gateway

```bash
# Verificar que el backend esté corriendo
pm2 status

# Verificar configuración de Nginx
nginx -t

# Ver logs de Nginx
tail -f /var/log/nginx/error.log
```

---

## 📝 Checklist Final

- [ ] Backend funcionando (PM2)
- [ ] Frontend accesible
- [ ] Nginx configurado correctamente
- [ ] Firewall configurado
- [ ] OBS conecta correctamente
- [ ] Stream se reproduce en el frontend
- [ ] SSL configurado (opcional)
- [ ] PM2 configurado para inicio automático
- [ ] Backups configurados

---

## 🎯 URLs Finales

Después del deployment, tendrás:

- **Frontend:** `http://tu-dominio.com/`
- **API:** `http://tu-dominio.com/api/stream/status`
- **RTMP para OBS:** `rtmp://tu-dominio.com/live`
- **HLS Stream:** `http://tu-dominio.com/live/live/index.m3u8`

---

## 💡 Consejos Adicionales

1. **Usa un dominio:** Es más profesional que usar IP
2. **Configura SSL:** Los navegadores modernos lo requieren
3. **Monitorea el servidor:** Usa herramientas como htop, netdata
4. **Haz backups regulares:** Especialmente de la configuración
5. **Actualiza regularmente:** `apt update && apt upgrade`
6. **Usa un stream key seguro:** Cambia el valor por defecto
7. **Considera CDN:** Para múltiples viewers simultáneos

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs: `pm2 logs` y `/var/log/nginx/`
2. Verifica la configuración: `.env` y `nginx.conf`
3. Prueba la conectividad: `curl`, `telnet`
4. Consulta la documentación de troubleshooting en el README

¡Listo! 🎉 Tu sistema de streaming debería estar funcionando.
