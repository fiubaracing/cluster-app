THIS_DIR=$(dirname "$0")
ROOT_DIR="$THIS_DIR/.."

set -eE

cd $ROOT_DIR

echo "Fetching latest code..."
git pull origin main

echo "Installing project dependencies..."
npm install

echo "Building Next.js production bundle..."
npm run build

echo "Starting Docker containers..."
docker compose -f $ROOT_DIR/docker-compose.yaml up -d 
echo "Waiting for PostgreSQL to start..."
until docker exec cluster-db pg_isready -U myuser > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL is ready!"

echo "Waiting for Redis to start..."
until docker exec cluster-redis redis-cli ping > /dev/null 2>&1; do
  sleep 1
done
echo "Redis is ready!"

echo "Installing PM2 and pm2-logrotate..."
npx -y pm2 install pm2-logrotate

echo "Deploying application using startOrRestart..."
npx -y pm2 startOrRestart ecosystem.config.js

echo "Saving PM2 process list..."
npx -y pm2 save

echo "Deployment completed successfully!"