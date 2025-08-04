module.exports = {
  apps: [{
    name: 'food-delivery-api',
    script: './dist/server.js', // or your entry point
    instances: 1, // Start with 1 for baseline, scale later
    exec_mode: 'fork',
    env_production: {
      NODE_ENV: 'production',
    },
    // Monitoring configuration
    log_file: './logs/combine.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    // Performance monitoring
    max_memory_restart: '500M',
    // Automatic restart on file changes (disable during load testing)
    watch: false,
    // Advanced monitoring
    monitoring: true,
    pmx: true
  }]
};