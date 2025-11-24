# 🚀 MarmaladeTech Deployment Guide

## 📋 **Pre-Deployment Checklist**

✅ All bugs fixed  
✅ Security vulnerabilities resolved  
✅ Database migrations ready  
✅ Static files configured  
✅ Admin user created  
✅ Production settings configured  

## 🎯 **Deployment Options**

### **Option 1: Railway Deployment (Recommended)**

#### **Step 1: Prepare Your Repository**
1. Ensure all files are committed to your Git repository
2. Make sure you have the following files:
   - `requirements.txt`
   - `railway.json`
   - `runtime.txt`
   - `DEPLOYMENT.md`

#### **Step 2: Deploy to Railway**
1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with your GitHub account
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your MarmaladeTech repository
5. Railway will automatically detect it's a Django project

#### **Step 3: Configure Environment Variables**
In Railway dashboard, go to your project → Variables tab and add:

```bash
SECRET_KEY=o%+%%8zj!7m=8y=ug4jdnzd=5la_bm9bghq^i)frli=wc=z-at
DEBUG=False
DATABASE_URL=postgresql://postgres:zxIiqdNJVLwNPEVAnkBxXxSGKaRbsvhC@ballast.proxy.rlwy.net:19556/railway
PGDATABASE=railway
PGHOST=ballast.proxy.rlwy.net
PGPASSWORD=zxIiqdNJVLwNPEVAnkBxXxSGKaRbsvhC
PGPORT=19556
PGUSER=postgres
```

#### **Step 4: Deploy**
1. Railway will automatically run the deployment
2. The deployment process will:
   - Install dependencies
   - Run migrations
   - Collect static files
   - Create admin user
   - Start the application

### **Option 2: Manual Deployment (VPS/Server)**

#### **Step 1: Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and dependencies
sudo apt install python3 python3-pip python3-venv nginx postgresql postgresql-contrib -y

# Create project directory
mkdir /var/www/marmaladetech
cd /var/www/marmaladetech
```

#### **Step 2: Clone and Setup**
```bash
# Clone your repository
git clone https://github.com/yourusername/MarmaladeTech.git .

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### **Step 3: Configure Environment**
```bash
# Create .env file
cat > .env << EOF
SECRET_KEY=o%+%%8zj!7m=8y=ug4jdnzd=5la_bm9bghq^i)frli=wc=z-at
DEBUG=False
DATABASE_URL=your_postgresql_connection_string
PGDATABASE=your_database_name
PGHOST=your_database_host
PGPASSWORD=your_database_password
PGPORT=5432
PGUSER=your_database_user
EOF
```

#### **Step 4: Database Setup**
```bash
# Setup PostgreSQL
sudo -u postgres createdb marmaladetech
sudo -u postgres createuser marmalade_user

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

#### **Step 5: Static Files and Gunicorn**
```bash
# Collect static files
python manage.py collectstatic --noinput

# Install Gunicorn
pip install gunicorn

# Create Gunicorn service
sudo nano /etc/systemd/system/marmaladetech.service
```

Add this content to the service file:
```ini
[Unit]
Description=MarmaladeTech Django Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/marmaladetech
Environment="PATH=/var/www/marmaladetech/venv/bin"
ExecStart=/var/www/marmaladetech/venv/bin/gunicorn --workers 3 --bind unix:/var/www/marmaladetech/marmaladetech.sock MarmaladeTech.wsgi:application

[Install]
WantedBy=multi-user.target
```

#### **Step 6: Nginx Configuration**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/marmaladetech
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /var/www/marmaladetech;
    }

    location /media/ {
        root /var/www/marmaladetech;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/var/www/marmaladetech/marmaladetech.sock;
    }
}
```

#### **Step 7: Start Services**
```bash
# Enable and start services
sudo systemctl enable marmaladetech
sudo systemctl start marmaladetech
sudo ln -s /etc/nginx/sites-available/marmaladetech /etc/nginx/sites-enabled
sudo systemctl restart nginx
```

## 🔑 **Admin Access**

After deployment, you can access the admin panel at:
- **URL:** `https://your-domain.com/admin`
- **Username:** `admin`
- **Email:** `admin@mdcatexpert.com`
- **Password:** `Admin@123`

## 🧪 **Testing Your Deployment**

### **1. Test the Homepage**
- Visit your domain: `https://your-domain.com`
- Should load without errors

### **2. Test User Registration**
- Go to: `https://your-domain.com/user/register`
- Create a new user account

### **3. Test Admin Panel**
- Go to: `https://your-domain.com/admin`
- Login with admin credentials
- Check if you can access all models

### **4. Test Quiz Functionality**
- Login as a user
- Go to: `https://your-domain.com/quiz/all_quiz`
- Should show quiz list

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Static Files Not Loading**
   ```bash
   python manage.py collectstatic --noinput
   ```

2. **Database Connection Issues**
   - Check environment variables
   - Verify PostgreSQL is running
   - Test connection manually

3. **Admin Panel Not Working**
   ```bash
   python manage.py createsuperuser
   ```

4. **500 Internal Server Error**
   - Check logs: `sudo journalctl -u marmaladetech`
   - Verify DEBUG=False in production

## 📞 **Support**

If you encounter any issues:
1. Check the logs in your deployment platform
2. Verify all environment variables are set correctly
3. Ensure database migrations have been applied
4. Test locally with `DEBUG=False` to simulate production

## 🎉 **Success!**

Once deployed, your MarmaladeTech application will be:
- ✅ Secure and production-ready
- ✅ Admin panel fully functional
- ✅ All features working properly
- ✅ Optimized for performance
- ✅ Ready for users to register and take quizzes
