# Deploying to Fly.io with PostgreSQL & Custom Domain

Follow these steps to deploy your Django project to Fly.io, using a proper **PostgreSQL database** (included in the free tier) and your Hostinger domain.

## Prerequisites

1.  **Install Fly CLI**:
    - **Windows (PowerShell)**: `pwsh -Command "iwr https://fly.io/install.ps1 -useb | iex"`
    - If `pwsh` is not found, try: `iwr https://fly.io/install.ps1 -useb | iex`
    - Restart your terminal after installation.
2.  **Sign Up / Login**:
    - Run: `fly auth signup` (or `fly auth login`).
    - *Note: A credit card is required for verification, but we will stay within the free limits (3 VMs total).*

## Step 1: Initialize the App

Run this in your project folder (`D:\Aadil Laptop\Projects\MarmaladeTech`):

```powershell
fly launch
```

- **Choose an app name** (e.g., `marmaladetech-web`).
- **Select a region** (Pick one close to you, e.g., `lhr` (London), `ams` (Amsterdam)).
- **Would you like to set up a Postgresql database now?** -> **YES**.
    - Select **Development** configuration (Single node, 256MB RAM) - *This fits the free tier.*
    - Fly will create the database app (e.g., `marmaladetech-web-db`) and automatically set the `DATABASE_URL` secret in your main app.
- **Would you like to set up an Upstash Redis database now?** -> **No**.
- **Would you like to deploy now?** -> **No** (We have a few more settings).

## Step 2: Configure Secrets

Run these commands to verify and set your secrets:

```powershell
# 1. Generate a secret key
fly secrets set SECRET_KEY="django-insecure-your-super-long-random-secret-key-here"

# 2. Set Debug to False
fly secrets set DEBUG="False"

# 3. Set Allowed Hosts
# Replace 'marmaladetech-web' with your actual app name
fly secrets set ALLOWED_HOSTS="marmaladetech-web.fly.dev,yourdomain.com,www.yourdomain.com"

# 4. Set CSRF Trusted Origins
fly secrets set CSRF_TRUSTED_ORIGINS="https://marmaladetech-web.fly.dev,https://yourdomain.com,https://www.yourdomain.com"
```

*Note: You do NOT need to set `DATABASE_URL` manually; `fly launch` did it when you said "Yes" to Postgres.*

## Step 3: Deploy

Now, deploy your app:

```powershell
fly deploy
```

Wait for it to finish.
Once done, run migrations to create your database tables:

```powershell
fly ssh console -C "python manage.py migrate"
```

Create a superuser for the admin panel:

```powershell
fly ssh console -C "python manage.py createsuperuser"
```

## Step 4: Custom Domain (Hostinger)

1.  **Fly.io Side**:
    - Run: `fly certs add yourdomain.com`
    - Run: `fly certs add www.yourdomain.com`
    - Fly will give you an **IP Address** (A Record).

2.  **Hostinger Side**:
    - Log in to Hostinger -> Manage DNS.
    - **Add 'A' Record**:
        - Host: `@`
        - Points to: `<The IP Address Fly gave you>`
        - TTL: 300
    - **Add 'CNAME' Record** (for www):
        - Host: `www`
        - Points to: `yourdomain.com`

3.  **Verify**:
    - Run `fly certs check yourdomain.com`

## Troubleshooting

- **Admin not working?** check `CSRF_TRUSTED_ORIGINS`.
- **Database connection error?** Run `fly secrets list` to ensure `DATABASE_URL` is set.
