# Ghumo Global — Self-Hosting Guide

For Vercel deployment in another account, use [DEPLOYMENT.md](./DEPLOYMENT.md).

## What's in this package

```
ghumo-global-production/
├── server/             ← Node.js server (all dependencies bundled)
│   └── index.mjs
├── public/             ← Website static files (HTML, CSS, JS, images)
├── uploads/            ← User-uploaded images (must be writable)
├── node_modules/       ← runtime dependencies
├── .env.example        ← Configuration template
├── package.json
├── start.sh            ← Startup script (Linux/macOS)
└── start.bat           ← Startup script (Windows)
```

---

## Requirements

- **Node.js 18 or later** (https://nodejs.org)
- **PostgreSQL 14 or later** (https://www.postgresql.org)

---

## Deploying on Vercel

This package includes `vercel.json` and a Vercel Function adapter for the bundled API. Static files are served from `public/`; API requests under `/api/*` run through `api/[...path].mjs`.

### 1. Create Vercel resources

1. Create a Vercel project from this repository.
2. Provision a PostgreSQL database that accepts external/Vercel connections.
3. Optional but recommended for CMS image uploads: add Vercel Blob Storage to the project.

### 2. Configure environment variables

Set these in Vercel Project Settings -> Environment Variables:

| Variable | Required | Description |
|---|---:|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string. Use SSL if your provider requires it. |
| `SESSION_SECRET` | Yes | Random 64+ character string for admin session signing. |
| `ADMIN_PASSWORD` | First deploy only | Initial admin password if the database has no saved admin hash yet. |
| `APP_ORIGIN` | Yes | Full production origin, currently `https://book.ghumoglobal.com`. |
| `BLOB_READ_WRITE_TOKEN` | For uploads | Vercel Blob token. Without this, CMS image upload returns a clear error on Vercel. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional | Password reset email transport. Without SMTP, reset links are logged. |

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Build and deploy

Local validation:

```bash
npm install
npm run build
```

Deploy:

```bash
vercel deploy
vercel deploy --prod
```

The server creates required tables on startup if they are missing. After the first successful admin login/password reset, remove `ADMIN_PASSWORD` from Vercel.

---

## Step-by-step setup

### 1. Create the database

```sql
CREATE DATABASE ghumo_global;
CREATE USER ghumo_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ghumo_global TO ghumo_user;
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
nano .env   # or use any text editor
```

Key values to set:

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on (default 3000) |
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Random 64-char string for session signing |
| `ADMIN_PASSWORD` | Your first admin password (15+ chars, 1 uppercase, 1 special) |
| `APP_ORIGIN` | Your full domain, currently `https://book.ghumoglobal.com` |

Generate a secure SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 3. Start the server

**Linux/macOS:**
```bash
chmod +x start.sh
./start.sh
```

**Windows:**
```
start.bat
```

**Or directly:**
```bash
node server/index.mjs
```

The server starts on the port in your `.env` (default 3000).
Open `http://localhost:3000` — you should see the website.

---

## Setting up Nginx (recommended for production)

Use Nginx as a reverse proxy in front of Node.js:

```nginx
server {
    listen 80;
    server_name book.ghumoglobal.com;
    return 301 https://book.ghumoglobal.com$request_uri;
}

server {
    listen 443 ssl;
    server_name book.ghumoglobal.com;

    ssl_certificate     /etc/letsencrypt/live/book.ghumoglobal.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/book.ghumoglobal.com/privkey.pem;

    # Increase upload size limit for admin image uploads
    client_max_body_size 25M;

    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
    }
}
```

Get a free SSL certificate with Certbot:
```bash
sudo certbot --nginx -d book.ghumoglobal.com
```

---

## Running as a background service (systemd)

Create `/etc/systemd/system/ghumo-global.service`:

```ini
[Unit]
Description=Ghumo Global Website
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/ghumo-global
EnvironmentFile=/var/www/ghumo-global/.env
ExecStart=/usr/bin/node /var/www/ghumo-global/server/index.mjs
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ghumo-global
sudo systemctl start ghumo-global
sudo systemctl status ghumo-global
```

---

## First login

1. Navigate to: `https://book.ghumoglobal.com/ghumo-cms/login`
2. Use the `ADMIN_PASSWORD` you set in `.env`
3. Immediately click **"Forgot password?"** to set a permanent strong password
4. After changing the password, remove `ADMIN_PASSWORD` from your `.env` (it's no longer needed)
5. Re-enter all your content through the admin panel

---

## uploads/ directory

All images uploaded via the admin panel are saved in the `uploads/` folder.
Make sure this directory is writable by the Node.js process:

```bash
chown -R www-data:www-data uploads/
chmod 755 uploads/
```

---

## Troubleshooting

**"Port already in use"** — change `PORT` in `.env`

**Database errors** — check `DATABASE_URL` is correct and PostgreSQL is running

**"SESSION_SECRET environment variable is required"** — make sure `.env` is in the same directory as `start.sh`

**Password reset not sending email** — SMTP vars must be set. Without them, the reset link is printed to the server console/log.
