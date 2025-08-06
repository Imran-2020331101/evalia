import app from './src/app';

const PORT = process.env.PORT || 7001;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Upskill Engine server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api`);
});
