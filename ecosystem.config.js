module.exports = {
    apps: [
        {
            name: 'calldoc-app',
            script: 'npm',
            args: 'start',
            cwd: '/home/han/calldoctor-app',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '1G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
