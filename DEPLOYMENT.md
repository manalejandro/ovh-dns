# Deployment Guide

This guide covers various deployment options for the OVH DNS Manager.

## 🚀 Deployment Options

### 1. Local/Self-Hosted Deployment

#### Using Node.js

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The application will run on port 3000 by default.

#### Using PM2 (Recommended for Production)

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the application with PM2:
```bash
pm2 start npm --name "ovh-dns-manager" -- start
```

3. Save the PM2 configuration:
```bash
pm2 save
pm2 startup
```

4. Monitor the application:
```bash
pm2 status
pm2 logs ovh-dns-manager
```

### 2. Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  ovh-dns-manager:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./config.json:/app/config.json
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Build and run:
```bash
docker-compose up -d
```

### 3. Nginx Reverse Proxy

Configure Nginx to serve the application:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

With SSL (using Let's Encrypt):

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### 4. Systemd Service

Create a systemd service file `/etc/systemd/system/ovh-dns-manager.service`:

```ini
[Unit]
Description=OVH DNS Manager
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ovh-dns-manager
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=ovh-dns-manager
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

Enable and start the service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ovh-dns-manager
sudo systemctl start ovh-dns-manager
sudo systemctl status ovh-dns-manager
```

## 🔒 Security Considerations

### 1. File Permissions

Ensure proper file permissions for config.json:
```bash
chmod 600 config.json
chown www-data:www-data config.json
```

### 2. Firewall Configuration

Only expose necessary ports:
```bash
# Allow only HTTPS
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. Environment Variables

For sensitive data, use environment variables instead of config.json:

```bash
export OVH_APP_KEY="your-app-key"
export OVH_APP_SECRET="your-app-secret"
export OVH_CONSUMER_KEY="your-consumer-key"
```

### 4. Regular Updates

Keep dependencies updated:
```bash
npm audit
npm update
```

## 📊 Monitoring

### Application Logs

- PM2: `pm2 logs ovh-dns-manager`
- Systemd: `journalctl -u ovh-dns-manager -f`
- Docker: `docker logs ovh-dns-manager -f`

### Health Checks

Create a health check endpoint monitoring:
```bash
curl http://localhost:3000/
```

## 🔄 Backup and Restore

### Backup Configuration

```bash
cp config.json config.json.backup-$(date +%Y%m%d)
```

### Automated Backups

Add to crontab:
```bash
0 2 * * * cp /path/to/config.json /path/to/backups/config.json.$(date +\%Y\%m\%d)
```

## 🚨 Troubleshooting

### Application Won't Start

1. Check logs
2. Verify Node.js version (18+)
3. Ensure all dependencies are installed
4. Check port 3000 availability

### Permission Denied

```bash
sudo chown -R $USER:$USER /path/to/ovh-dns-manager
chmod -R 755 /path/to/ovh-dns-manager
chmod 600 config.json
```

### Port Already in Use

Change the port:
```bash
PORT=3001 npm start
```

## 📝 Notes

- Keep `config.json` secure and never commit it to version control
- Use HTTPS in production
- Regularly backup your configuration
- Monitor application logs for errors
- Keep the application and dependencies updated

---

For more information, refer to the main [README.md](README.md)
