import app from './app';
import config from './config';

const PORT = config.PORT;

// Start server
const server = app.listen(PORT, () => {
  console.log(`Resume Service running on port ${PORT}`);
});

// Set server timeouts for AI processing
server.timeout = config.REQUEST_TIMEOUT;
server.keepAliveTimeout = config.KEEPALIVE_TIMEOUT;

// Basic error handling
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
    process.exit(1);
  }
  throw error;
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close(() => process.exit(0));
});

export default app;
