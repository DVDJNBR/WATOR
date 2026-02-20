#!/bin/bash
set -e

# Configuration
PROJECT_DIR="/home/utilisateur/wator"
BRANCH="main"

echo "=== Starting deployment at $(date) ==="

# Navigate to project directory
cd "$PROJECT_DIR"

# Pull latest changes
echo "Pulling latest changes from $BRANCH..."
git fetch origin
git reset --hard origin/$BRANCH

# Rebuild and restart containers
echo "Rebuilding Docker containers..."
docker-compose down
docker-compose build
docker-compose up -d

# Show logs
echo "Deployment complete! Container status:"
docker-compose ps

echo "=== Deployment finished at $(date) ==="
