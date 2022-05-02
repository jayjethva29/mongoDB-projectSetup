const { promisify } = require('util');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const handllerFactory = require('./handllerFactory');
const AppError = require('../utils/AppError');

exports.singup = async (req, res, next) => {
  try {
    handllerFactory.removeFieldsFromBody(['role', 'active', 'photo'], req.body);
    const newUser = await User.create(req.body);

    //TODO: Send welcome email

    req.userId = newUser.id;
    newUser.__v = newUser.password = newUser.confirmPassword = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        data: newUser,
      },
    });
    next();
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError(400, 'Please provide your email and password!'));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password)))
    return next(new AppError(401, 'Incorrect email or password!'));

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie('jwt', token, cookieOpts);
  res.status(200).json({
    status: 'success',
    message: 'Login succesfull',
  });
};

exports.protectRoute = async (req, res, next) => {
  try {
    if (!req.cookies.jwt)
      return next(new AppError(401, 'You are not logged in!'));

    const token = req.cookies.jwt;
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    // if(!user) return next(new AppError(401, 'You don\'t have account!'));
    if (user.isPassChangedAfterJWT(decoded.iat))
      return next(
        new AppError(
          401,
          'User has recently changed password! Please login again'
        )
      );

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError')
      next(new AppError(401, 'Invalid token!'));
    else if (err.name === 'TokenExpiredError')
      next(new AppError(401, 'Your token has expired. Please Login again'));
    else next(err);
  }
};

exports.isAdmin = (req, res, next) => {
  if (!req.user.isAdmin)
    return next(
      new AppError(403, "You don't have permission to perform this task")
    );
  next();
};
// exports.restrictTo =
//   (...allowedRoles) =>
//   (req, res, next) => {
//     if (!allowedRoles.includes(req.user.role))
//       return next(
//         new AppError(403, "You don't have permission to perform this task")
//       );
//     next();
//   };

exports.logout = (req, res) => {
  res.cookie('jwt', null);
  res.status(200).json({
    status: 'success',
    message: 'Logged out',
  });
};
