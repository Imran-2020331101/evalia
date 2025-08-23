import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import app from './src/app';

const PORT = process.env.PORT || 7000;

app.listen(PORT, () => {
  console.log('Job service running in ', { port: PORT })
});
