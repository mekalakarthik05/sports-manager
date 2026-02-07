module.exports = {
  apps: [
    {
      name: 'ssports-api',
      script: 'server.js',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'development' },
      env_production: { NODE_ENV: 'production' },
      max_memory_restart: '500M',
    },
  ],
};
