#!/bin/bash
# ============================================================
# EduTN — VPS Deployment Script
# Ubuntu 22.04 LTS — Full Stack Setup
# ============================================================

set -e

echo "=========================================="
echo "  EduTN Deployment Script — Ubuntu 22.04"
echo "=========================================="

# ------------------------------------------------------------
# 1. Initial Server Setup
# ------------------------------------------------------------
echo "[1/10] Initial server setup..."

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git unzip software-properties-common ufw

# Create deploy user (optional)
# adduser deploy
# usermod -aG sudo deploy

# Configure firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw --force enable

echo "[1/10] Done."

# ------------------------------------------------------------
# 2. Install Nginx + PHP 8.2 + MySQL 8
# ------------------------------------------------------------
echo "[2/10] Installing Nginx, PHP 8.2, MySQL 8..."

# Nginx
apt install -y nginx

# PHP 8.2
add-apt-repository -y ppa:ondrej/php
apt update
apt install -y php8.2-fpm php8.2-cli php8.2-mysql php8.2-curl php8.2-gd \
  php8.2-mbstring php8.2-xml php8.2-zip php8.2-bcmath php8.2-intl \
  php8.2-dom php8.2-tokenizer php8.2-fileinfo

# MySQL 8
apt install -y mysql-server
mysql_secure_installation

echo "[2/10] Done."

# ------------------------------------------------------------
# 3. Install Node.js 20 + PM2
# ------------------------------------------------------------
echo "[3/10] Installing Node.js 20 + PM2..."

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
npm install -g pm2

echo "[3/10] Done."

# ------------------------------------------------------------
# 4. Install phpMyAdmin
# ------------------------------------------------------------
echo "[4/10] Installing phpMyAdmin..."

apt install -y phpmyadmin

echo "[4/10] Done."

# ------------------------------------------------------------
# 5. Clone and Configure Laravel
# ------------------------------------------------------------
echo "[5/10] Deploying Laravel backend..."

# Clone repo
cd /var/www
git clone https://github.com/your-repo/edutn.git
cd edutn/backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Environment
cp .env.example .env
php artisan key:generate

# Configure .env
cat > .env << 'EOF'
APP_NAME=EduTN
APP_ENV=production
APP_KEY=base64:GENERATE_KEY_HERE
APP_DEBUG=false
APP_URL=https://edutn.tn

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=edutn
DB_USERNAME=edutn_user
DB_PASSWORD=SECURE_PASSWORD_HERE

CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls

ANTHROPIC_API_KEY=your-claude-api-key
EOF

# Create database and user
mysql -u root << EOSQL
CREATE DATABASE IF NOT EXISTS edutn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'edutn_user'@'localhost' IDENTIFIED BY 'SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON edutn.* TO 'edutn_user'@'localhost';
FLUSH PRIVILEGES;
EOSQL

# Run migrations
php artisan migrate --force
php artisan db:seed --force

# Storage link
php artisan storage:link

# Cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Queue worker
pm2 start "php artisan queue:work --sleep=3 --tries=3" --name="edutn-queue"

echo "[5/10] Done."

# ------------------------------------------------------------
# 6. Build and Deploy Next.js
# ------------------------------------------------------------
echo "[6/10] Building Next.js frontend..."

cd /var/www/edutn
npm install
npm run build

# Start with PM2
pm2 start npm --name "edutn-frontend" -- run start -- -p 3000
pm2 save

echo "[6/10] Done."

# ------------------------------------------------------------
# 7. Configure Nginx
# ------------------------------------------------------------
echo "[7/10] Configuring Nginx..."

cat > /etc/nginx/sites-available/edutn << 'EOF'
# Frontend (Next.js)
server {
    listen 80;
    server_name edutn.tn www.edutn.tn;

    # Frontend proxy
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API proxy
    location /api {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Laravel Backend
server {
    listen 80;
    server_name api.edutn.tn;

    root /var/www/edutn/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.ht {
        deny all;
    }
}
EOF

ln -sf /etc/nginx/sites-available/edutn /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "[7/10] Done."

# ------------------------------------------------------------
# 8. SSL Certificate with Certbot
# ------------------------------------------------------------
echo "[8/10] Installing SSL certificates..."

apt install -y certbot python3-certbot-nginx
certbot --nginx -d edutn.tn -d www.edutn.tn -d api.edutn.tn --non-interactive --agree-tos --email admin@edutn.tn

echo "[8/10] Done."

# ------------------------------------------------------------
# 9. Install and Configure Soketi (WebSocket)
# ------------------------------------------------------------
echo "[9/10] Installing Soketi..."

npm install -g @soketi/soketi

# Create Soketi config
cat > /etc/soketi/config.json << 'EOF'
{
    "port": 6001,
    "appManager": "array",
    "apps": [
        {
            "id": "edutn",
            "key": "edutn-key",
            "secret": "edutn-secret",
            "webhooks": []
        }
    ]
}
EOF

# Start Soketi with PM2
pm2 start soketi --name "edutn-soketi" -- start --config=/etc/soketi/config.json
pm2 save

echo "[9/10] Done."

# ------------------------------------------------------------
# 10. MySQL Backup Cron + Security Hardening
# ------------------------------------------------------------
echo "[10/10] Setting up backups and security..."

# MySQL backup cron (daily at 3 AM)
cat > /etc/cron.d/edutn-backup << 'EOF'
0 3 * * * root mysqldump -u edutn_user -pSECURE_PASSWORD_HERE edutn | gzip > /var/backups/edutn/edutn-$(date +\%Y\%m\%d).sql.gz
EOF

mkdir -p /var/backups/edutn

# Remove backup files older than 30 days
cat > /etc/cron.d/edutn-cleanup << 'EOF'
0 4 * * * root find /var/backups/edutn -name "*.sql.gz" -mtime +30 -delete
EOF

# Security hardening
# Disable root SSH login
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart sshd

# Install fail2ban
apt install -y fail2ban
systemctl enable fail2ban

echo "[10/10] Done."

echo ""
echo "=========================================="
echo "  EduTN Deployment Complete!"
echo "=========================================="
echo ""
echo "Frontend: https://edutn.tn"
echo "API:      https://api.edutn.tn"
echo "phpMyAdmin: https://edutn.tn/phpmyadmin"
echo ""
echo "PM2 processes:"
pm2 list
echo ""
echo "Next steps:"
echo "1. Update .env with your API keys"
echo "2. Configure D17, Konnect, Flouci API keys"
echo "3. Set up SMTP credentials for email"
echo "4. Configure Anthropic API key for AI"
echo "5. Test all endpoints"
