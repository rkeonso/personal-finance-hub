import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';

const PORT = process.env.PORT || 5001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';


app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});