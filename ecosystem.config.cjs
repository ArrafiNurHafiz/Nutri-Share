module.exports = {
  apps: [{
    name: "nutrishare",
    script: "dist/server.cjs",
    instances: 1,
    exec_mode: "fork",
    env_production: {
      NODE_ENV: "production",
      PORT: 3000,
    },
    max_memory_restart: "512M",
    error_file: "logs/error.log",
    out_file: "logs/out.log",
    merge_logs: true,
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
  }],
};
