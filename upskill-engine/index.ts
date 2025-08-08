import app from './src/app';
import logger from './src/config/logger';

const PORT = process.env.PORT || 7001;

// Start server
app.listen(PORT, () => {
  logger.info('🚀 Upskill Engine server running', { port: PORT });
  logger.info('📚 API base', { url: `http://localhost:${PORT}/api` });
});
