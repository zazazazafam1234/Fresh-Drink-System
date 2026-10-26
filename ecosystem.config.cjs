const path = require('node:path');

const adminRoot = path.join(__dirname, 'fresh-drink-admin---smart-ro-system');
const freshDrinkRoot = path.join(__dirname, 'fresh-drink');

module.exports = {
  apps: [
    {
      name: 'fresh-drink-api',
      script: path.join(adminRoot, 'server.js'),
      cwd: adminRoot,
      env: {
        HOST: '0.0.0.0',
        PORT: '3001',
      },
    },
    {
      name: 'fresh-drink-ui',
      script: path.join(freshDrinkRoot, 'node_modules', 'vite', 'bin', 'vite.js'),
      args: ['preview', '--host', '0.0.0.0', '--port', '3003'],
      cwd: freshDrinkRoot,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};