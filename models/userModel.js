const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required for a user!'],
      trim: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, 'email is required for a user!'],
      trim: true,
      lowercase: true,
      unique: true,
      validate: [validator.isEmail, 'invalid email!'],
    },
    password: {
      type: String,
      required: [true, 'password is required for a user!'],
      trim: true,
      select: false,
      validate: {
        validator: function (val) {
          return validator.isStrongPassword(val, {
            minLength: 5,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message:
          'password must have minimum 5 characters with at least one lowercase, one uppercase and a symbol!',
      },
    },
    confirmPassword: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (val) {
          return val === this.password;
        },
        message: "Passwords don't match!",
      },
    },
    photo: {
      type: String,
      default: 'default.png',
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // role: {
    //   type: String,
    //   default: 'user',
    //   enum: {
    //     values: ['user', 'admin'],
    //     message: 'Invalid role! role cane be either user or admin ',
    //   },
    // },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
});

userSchema.methods.isPassChangedAfterJWT = function (jwtTimeStamp) {
  if (!this.passChangedAt) return false;

  const passChangeTimeStamp = parseInt(this.passChangedAt.getTime() / 1000, 10);
  return jwtTimeStamp < passChangeTimeStamp;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
