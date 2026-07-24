#!/bin/bash
# ============================================================
# Clipnote Backend — EC2 t2.micro Setup Script (Ubuntu 22.04)
# Run this ONCE after SSHing into your EC2 instance
# Usage: bash setup.sh
# ============================================================

set -e  # Exit on any error

echo "============================================"
echo "  Clipnote Backend EC2 Setup"
echo "============================================"

# --- 1. System Update ---
echo "[1/7] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

# --- 2. Add 1.5 GB Swap (critical for t2.micro with 1 GB RAM) ---
echo "[2/7] Setting up swap space..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 1536M /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    echo "Swap created successfully."
else
    echo "Swap already exists, skipping."
fi

# --- 3. Install System Dependencies ---
echo "[3/7] Installing Python, ffmpeg, git, nginx..."
sudo apt-get install -y \
    python3 \
    python3-venv \
    python3-pip \
    ffmpeg \
    git \
    nginx \
    curl

# --- 4. Clone Repository ---
echo "[4/7] Cloning repository..."
cd /home/ubuntu

if [ -d "StudyApp" ]; then
    echo "Repo already exists, pulling latest..."
    cd StudyApp && git pull
else
    git clone https://github.com/Johan-Andrews/StudyApp.git
    cd StudyApp
fi

# --- 5. Python Virtual Environment & Dependencies ---
echo "[5/7] Installing Python dependencies..."
cd /home/ubuntu/StudyApp/backend

python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# --- 6. Create directories ---
echo "[6/7] Creating upload/export directories..."
mkdir -p /home/ubuntu/StudyApp/backend/uploads
mkdir -p /home/ubuntu/StudyApp/backend/exports

# --- 7. Configure Nginx as reverse proxy ---
echo "[7/7] Configuring Nginx..."
sudo tee /etc/nginx/sites-available/clipnote > /dev/null <<'NGINX'
server {
    listen 80;
    server_name _;

    # Allow large file uploads (up to 500MB for evaluation)
    client_max_body_size 500M;
    # Long timeout for AI processing
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;
    proxy_connect_timeout 600s;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
NGINX

sudo ln -sf /etc/nginx/sites-available/clipnote /etc/nginx/sites-enabled/clipnote
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
sudo systemctl enable nginx

echo ""
echo "============================================"
echo "  Setup Complete!"
echo "  Next step: run   bash configure_env.sh"
echo "============================================"
