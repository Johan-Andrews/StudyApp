#!/bin/bash
# ============================================================
# Clipnote — Configure .env and start the backend service
# Run AFTER setup.sh
# Usage: bash configure_env.sh YOUR_GEMINI_API_KEY
# ============================================================

set -e

GEMINI_KEY="${1:-}"

if [ -z "$GEMINI_KEY" ]; then
    echo "Usage: bash configure_env.sh YOUR_GEMINI_API_KEY"
    echo ""
    echo "Example:"
    echo "  bash configure_env.sh AIzaSyXXXXXXXXXXXXXXXXXXXXXXX"
    exit 1
fi

echo "Writing .env file..."
cat > /home/ubuntu/StudyApp/backend/.env <<EOF
GEMINI_API_KEY=${GEMINI_KEY}
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_KEY=
CLOUDINARY_CLOUD_NAME=
EOF

echo ".env written."

# --- Create systemd service ---
echo "Creating systemd service..."
sudo tee /etc/systemd/system/clipnote.service > /dev/null <<'SERVICE'
[Unit]
Description=Clipnote FastAPI Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/StudyApp/backend
Environment="PATH=/home/ubuntu/StudyApp/backend/venv/bin"
ExecStart=/home/ubuntu/StudyApp/backend/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
SERVICE

sudo systemctl daemon-reload
sudo systemctl enable clipnote
sudo systemctl restart clipnote

echo ""
echo "============================================"
echo "  Backend is starting..."
sleep 3
sudo systemctl status clipnote --no-pager
echo ""
echo "  Test it: curl http://localhost:8000/api/lectures"
echo "============================================"
