const Client = require('./Structures/client');
const client = new Client();

process.on('unhandledRejection', (reason, pr) => {
    console.error('[Anti-Crash] :: Unhandled Rejection/Catch');
    console.error(reason, pr);
});

process.on('uncaughtException', (error) => {
    console.error('[Anti-Crash] :: Uncaught Exception/Catch');
    console.error(error);
});

process.on('SIGINT', () => {
    console.log('[Process] :: Shutdown Initiated');
    client.destroy();
    process.exit(0);
});

client.start().catch(error => {
    console.error('[Startup] :: Client Failed to Initialize');
    console.error(error);
    process.exit(1);
});