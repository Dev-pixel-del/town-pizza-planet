module.exports = {
  apps: [{
    name: 'town-pizza-planet',
    script: 'src/server.js',
    cwd: __dirname,
    watch: false,
    autorestart: true,
    restart_delay: 5000,
    max_restarts: 50,
    max_memory_restart: '450M',
    env: { NODE_ENV: 'production' },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: 'logs/app-error.log',
    out_file: 'logs/app-out.log',
    merge_logs: true,
  }]
};
