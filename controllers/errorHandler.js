const AppError = require('../utils/AppError');

const sendError = function (err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

  if (!err.isAppError && process.env.NODE_ENV !== 'production')
    console.log(err);
};

const errorHandler = function (err, req, res, next) {
  if (err.name === 'CastError')
    return sendError(
      new AppError(400, `Invalid parameter (${err.path}) in the URL!`),
      res
    );
  if (err.name === 'ValidationError')
    return sendError(new AppError(400, err.message), res);
  if (err.code === 11000)
    return sendError(
      new AppError(
        400,
        `Data already exist for this ${Object.keys(err.keyValue)[0]}`
      ),
      res
    );

  err.status = err.status || 'error';
  err.statusCode = err.statusCode || 500;

  err.message =
    process.env.NODE_ENV === 'production' && !err.isAppError
      ? 'Something Went Wrong!'
      : err.message;

  sendError(err, res);
};

module.exports = errorHandler;
