THIS_DIR=$(dirname "$0")
ROOT_DIR="$THIS_DIR/.."

set -eE

cd $ROOT_DIR

echo "Destroying Docker containers (not volumes)..."
docker compose -f $ROOT_DIR/docker-compose.yaml down

echo "Removing PM2 processes and logs..."
npx -y pm2 uninstall pm2-logrotate
npx -y pm2 delete cluster-app
rm -rf .next/
rm -rf node_modules/
rm -rf .pm2/