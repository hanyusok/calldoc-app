module.exports = {
    apps: [
        {
            name: 'calldoc-app',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            cwd: '/home/han/calldoc-app',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '4G',
            env: {
                NODE_ENV: 'production',
                PORT: 3000
            }
        }
    ]
};
