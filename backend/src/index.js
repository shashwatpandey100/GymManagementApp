import app from './app.js';
import connectDb from './db/index.js';

const PORT = process.env.PORT || 8000;

connectDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`server is running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log('MONGODB CONNECTION FAILED: ', error);
    process.exit(1);
  });
