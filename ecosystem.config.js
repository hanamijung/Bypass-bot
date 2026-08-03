module.exports = {
    apps: [
        {
            name: 'platobypass',
            script: './index.js',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production'
            },
            restart_delay: 3000,
            log_file: './logs/combined.log',
            out_file: './logs/out.log',
            error_file: './logs/error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            max_restarts: 10,
            min_uptime: '10s'
        }
    ]
};
