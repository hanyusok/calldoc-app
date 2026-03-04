module.exports = {
    apps: [
        {
            name: 'calldoc-app',
            script: 'node_modules/next/dist/bin/next',
            args: 'start',
            cwd: '/home/han/calldoc-app',

            // Cluster mode: 4 instances = 1 per physical core (i7-7700 has 4 cores).
            // This gives parallel request handling while avoiding context-switch overhead
            // from over-provisioning (do NOT use 'max' / 8 — that wastes resources here).
            instances: 4,
            exec_mode: 'cluster',

            autorestart: true,
            watch: false,

            // 1 GB per instance × 4 = 4 GB max total.
            // With 56 GB free RAM this is very conservative — but Next.js rarely
            // exceeds 400–600 MB even under load, so this is a safe hard ceiling.
            max_memory_restart: '1G',

            // Restart if the process is unresponsive for 10 s (catches infinite loops / hangs).
            listen_timeout: 10000,

            // Keep old instances alive until new ones are ready (zero-downtime deploys).
            wait_ready: true,
            kill_timeout: 5000,

            // Log rotation — keep logs manageable over time.
            error_file: '/home/han/calldoc-app/logs/err.log',
            out_file: '/home/han/calldoc-app/logs/out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',
            merge_logs: true,

            env: {
                NODE_ENV: 'production',
                PORT: 3000,
                // Prevents Node from buffering streams too aggressively in cluster mode.
                UV_THREADPOOL_SIZE: 8
            }
        }
    ]
};
