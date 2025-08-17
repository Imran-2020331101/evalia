import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import app from './src/app';

const PORT = process.env.PORT || 7001;

app.listen(PORT, () => {
  console.log('Upskill Engine server running', { port: PORT })

});
