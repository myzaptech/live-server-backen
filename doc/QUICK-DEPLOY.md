# ⚡ Quick Deploy - Resumen Rápido

## 🎯 Comandos Esenciales para DigitalOcean

### 1️⃣ Preparar Servidor (Una sola vez)

```bash
# Conectar al droplet
ssh root@tu-ip

# Instalar todo lo necesario
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt update && apt upgrade -y
apt install -y nodejs ffmpeg nginx git
npm install -g pm2

# Verificar
node --version && ffmpeg -version && nginx -v && pm2 --version
```

### 2️⃣ Subir Proyecto

**Opción A: Git (Recomendado)**
```bash
cd /var/www
git clone tu-repo-github.git live-stream
cd live-stream
npm install --production
```

**Opción B: SCP desde Windows**
```powershell
scp -r p:\JS\live-stream root@tu-ip:/var/www/
scp -r p:\JS\live-stream-frontend root@tu-ip:/var/www/html/
```

### 3️⃣ Configurar Backend

```bash
cd /var/www/live-stream

# Copiar y editar configuración
cp .env.production .env
nano .env  # Editar: DOMAIN, STREAM_KEY, etc.

# Crear directorios
mkdir -p /var/www/streams/live logs
chmod -R 755 /var/www/streams
```

### 4️⃣ Configurar Nginx

```bash
cp nginx.conf /etc/nginx/sites-available/live-stream
nano /etc/nginx/sites-available/live-stream  # Cambiar server_name

ln -s /etc/nginx/sites-available/live-stream /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Opcional

nginx -t
systemctl restart nginx
```

### 5️⃣ Iniciar con PM2

```bash
cd /var/www/live-stream
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Seguir instrucciones
```

### 6️⃣ Configurar Firewall

```bash
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw allow 1935/tcp # RTMP
ufw enable
```

### 7️⃣ Frontend

```bash
cd /var/www/html/live-stream-frontend

# Cambiar a config de producción
sed -i 's/config.js/config.production.js/' index.html

# Editar URLs
nano js/config.production.js  # Cambiar tu-dominio.com

chmod -R 755 /var/www/html/live-stream-frontend
chown -R www-data:www-data /var/www/html/live-stream-frontend
```

### 8️⃣ Probar

```bash
# Ver logs
pm2 logs live-stream-api

# Probar API
curl http://localhost:3000/api/stream/status

# Ver en navegador
http://tu-ip/
```

---

## 🔥 Comandos Útiles

### PM2
```bash
pm2 status                    # Estado
pm2 logs live-stream-api      # Ver logs
pm2 restart live-stream-api   # Reiniciar
pm2 stop live-stream-api      # Detener
```

### Nginx
```bash
nginx -t                      # Verificar config
systemctl restart nginx       # Reiniciar
tail -f /var/log/nginx/error.log  # Ver errores
```

### Actualizar Proyecto
```bash
cd /var/www/live-stream
git pull origin main
npm install --production
pm2 restart live-stream-api
```

---

## 🎯 URLs Finales

- **Frontend**: `http://tu-ip/`
- **API**: `http://tu-ip/api/stream/status`
- **RTMP (OBS)**: `rtmp://tu-ip/live`
- **Stream Key**: `live` (o el que configuraste)

---

## 🐛 Troubleshooting Rápido

**Backend no inicia:**
```bash
pm2 logs live-stream-api
netstat -tulpn | grep 3000
```

**OBS no conecta:**
```bash
netstat -tulpn | grep 1935
ufw status
```

**Stream no reproduce:**
```bash
ps aux | grep ffmpeg
ls -la /var/www/streams/live/live/
```

**Error 502:**
```bash
pm2 status
nginx -t
tail -f /var/log/nginx/error.log
```

---

## 📚 Documentación Completa

Para más detalles, consulta: **[DEPLOYMENT.md](DEPLOYMENT.md)**
