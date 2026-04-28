# Ghumo Global Vercel Deployment Checklist

Use this when the production Vercel project is owned by another account.

## 1. Push This Repo To GitHub

Commit and push all project files except ignored local/generated folders:

- `.vercel/`
- `node_modules/`
- `graphify-out/`
- `.env`

Do not commit Neon, Vercel, SMTP, or admin passwords.

## 2. Import In The Production Vercel Account

In the account that will own the live site:

1. Go to Vercel -> Add New -> Project.
2. Import the GitHub repository.
3. Use these project settings:

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Build Command | `npm run build` |
| Output Directory | `public` |
| Install Command | `npm install` |

The repository already includes `vercel.json`, so Vercel should detect most of this automatically.

## 3. Add Environment Variables

In Vercel -> Project -> Settings -> Environment Variables, add:

| Name | Value |
|---|---|
| `DATABASE_URL` | Neon/Supabase/Postgres connection string with `sslmode=require` |
| `SESSION_SECRET` | Random 64+ character secret |
| `APP_ORIGIN` | The final site origin, currently `https://book.ghumoglobal.com` |
| `ADMIN_PASSWORD` | First admin login password only |

This repo has a local `.env` file for copy-paste into Vercel. It is intentionally ignored by Git and must not be pushed.

Before uploading/copying it to Vercel, confirm:

```env
APP_ORIGIN="https://book.ghumoglobal.com"
```

with the real Vercel or custom-domain origin.

Generate `SESSION_SECRET` locally:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Use an `ADMIN_PASSWORD` with at least 15 characters, 1 uppercase letter, and 1 symbol.

Optional for CMS image uploads:

| Name | Value |
|---|---|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token from the same Vercel project |

Optional for password reset email:

| Name | Value |
|---|---|
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | Usually `587` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password |
| `SMTP_FROM` | Sender email |

## 4. Deploy

After env vars are set:

1. Click Deploy or Redeploy in Vercel.
2. Wait for status `Ready`.
3. Open:

```text
https://YOUR_DOMAIN/ghumo-cms/login
```

Log in with `ADMIN_PASSWORD`.

## 5. After First Successful Admin Login

Remove `ADMIN_PASSWORD` from Vercel environment variables and redeploy. The saved admin password hash remains in the database.

## 6. Custom Domain

When connecting a custom domain:

1. Add the domain in Vercel -> Project -> Settings -> Domains.
2. Update DNS at the domain provider exactly as Vercel instructs.
3. Change `APP_ORIGIN` to the custom domain, for example:

```env
APP_ORIGIN=https://book.ghumoglobal.com
```

4. Redeploy.
