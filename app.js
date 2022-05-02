const express = require('express');
const errorHandler = require('./controllers/errorHandler');
const AppError = require('./utils/AppError');
const email = require('./utils/email');
const userRoutes = require('./routes/userRoutes');

const app = express();

//Gloabal Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Entry points
app.use('/api/v1/users', userRoutes);

app.all('*', (req, _, next) => {
  next(new AppError(404, `Can't find ${req.originalUrl} on this server!`));
});

app.use(errorHandler);

module.exports = app;
