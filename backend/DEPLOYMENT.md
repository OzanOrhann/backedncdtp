# 🔧 Backend Deployment Guide

## Cloud Deployment Seçenekleri

Backend'inizi bulut ortamına deploy edebilirsiniz:

---

## 1️⃣ Heroku (Ücretsiz Tier)

### Kurulum:
```bash
# Heroku CLI kurulumu
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Proje oluştur
cd backend
heroku create cdtp-backend

# Environment variables
heroku config:set NODE_ENV=production

# Deploy
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

### Procfile oluştur:
```
web: node server.js
```

Frontend'te URL:
```javascript
const BACKEND_URL = 'https://cdtp-backend.herokuapp.com';
```

---

## 2️⃣ Render.com (Ücretsiz)

1. GitHub'a backend'i yükle
2. render.com'a git ve "New Web Service" oluştur
3. GitHub repo'sunu bağla
4. Ayarlar:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

Frontend'te URL:
```javascript
const BACKEND_URL = 'https://cdtp-backend.onrender.com';
```

---

## 3️⃣ Railway (Kolay)

1. railway.app'e git
2. "Deploy from GitHub repo"
3. Backend klasörünü seç
4. Otomatik deploy edilir

Frontend'te URL:
```javascript
const BACKEND_URL = 'https://cdtp-backend.railway.app';
```

---

## 4️⃣ AWS (EC2 - Üretim ortamı)

### SSH ile bağlan:
```bash
ssh -i key.pem ubuntu@YOUR_EC2_IP
```

### Kurulum:
```bash
# Node.js kur
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kur (process manager)
sudo npm install -g pm2

# Projeyi indir
git clone YOUR_REPO
cd backend
npm install

# .env oluştur
nano .env

# Başlat
pm2 start server.js --name cdtp-backend
pm2 startup
pm2 save
```

### Nginx reverse proxy:
```bash
sudo apt install nginx

# Nginx config
sudo nano /etc/nginx/sites-available/cdtp
```

```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN_OR_IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/cdtp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 5️⃣ DigitalOcean App Platform

1. digitalocean.com'a git
2. "Create App"
3. GitHub repo bağla
4. Ayarlar otomatik algılanır
5. Deploy

---

## 🔒 Production Güvenlik

### 1. Environment Variables
```env
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://your-frontend.com
```

### 2. CORS Güvenliği
`server.js` içinde:
```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
```

### 3. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100 // maksimum 100 istek
});

app.use(limiter);
```

### 4. Helmet (Güvenlik header'ları)
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

---

## 📊 Monitoring

### PM2 ile monitoring (production):
```bash
pm2 monit
pm2 logs
pm2 restart all
```

### Log dosyaları:
```bash
pm2 logs cdtp-backend --lines 100
```

---

## 🚀 Otomatik Deploy (CI/CD)

### GitHub Actions örneği:
`.github/workflows/deploy.yml`
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /var/www/cdtp-backend
            git pull
            npm install
            pm2 restart cdtp-backend
```

---

## 💡 İpuçları

1. **Ücretsiz başlayın**: Heroku, Render, Railway ücretsiz tier'ları test için yeterli
2. **Domain**: Cloudflare ile ücretsiz domain ve SSL
3. **Monitoring**: UptimeRobot ile ücretsiz uptime monitoring
4. **Backup**: Düzenli database backup (eğer DB eklerseniz)

---

## 🆘 Sorun Giderme

**Port hatası:**
```bash
# Farklı port kullan
PORT=8080 npm start
```

**Memory hatası:**
```bash
# PM2 ile restart
pm2 restart cdtp-backend --max-memory-restart 300M
```

**Log kontrolü:**
```bash
pm2 logs cdtp-backend --err
```
