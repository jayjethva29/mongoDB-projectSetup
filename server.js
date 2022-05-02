const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

if (process.argv[2] === '--prod') process.env.NODE_ENV = 'production';

process.on('uncaughtException', (err) => {
  console.log(`🧩 Uncaught Exception 🤪`);
  console.log(err);
  process.exit(1);
});

// Imports
const mongoose = require('mongoose');
const app = require('./app');
const Media = require('./models/mediaModel');

//DB Connection
// const DB = process.env.DATABASE.replace('<password>', process.env.DB_PASSWORD);
const DB = `mongodb+srv://akash:akash08@cluster0.5dwi5.mongodb.net/sandee`;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✔ Database connection successful'))
  .catch((err) => {
    console.log('🧩 Database connection failed');
    console.log(err.message);
  });

//Server
const server = app.listen(process.env.PORT, () => {
  console.log(
    `✔ Server is listening at port ${process.env.PORT} in ${process.env.NODE_ENV}`
  );
});

process.on('unhandledRejection', (err) => {
  console.log(`🧩 Unhandled Rejection 🤪`);
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
