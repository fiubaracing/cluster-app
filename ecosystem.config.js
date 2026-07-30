// Do not convert this to ESM, as PM2 does not support ESM for ecosystem files yet.
module.exports = {
  apps: [
    {
      name: 'cluster-app',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1024M',
      out_file: "/dev/null", 
      error_file: "./logs/pm2-error.log",
      merge_logs: true,
    },
  ],
};