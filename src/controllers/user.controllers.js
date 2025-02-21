const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let imagekit = require("../utils/imagekit.js").initImageKit();

const UserSchema = require("../models/user.schema.js");

exports.current_user = catchAsyncErrors(async (req, res, next) => {
  let user = await UserSchema.findById(req.id)
  if (!user) return next(new ErrorHandler("User not found", 404));
  res.json({ success: true, user: user });
});

exports.create_user = catchAsyncErrors(async (req, res, next) => {

  const { name, email, password, avatar } = req.body;

  if ([name, email, password].some((field) => !field?.trim())) {
    return next(new ErrorHandler("User details are required", 400));
  }

  const existedUser = await UserSchema.findOne({ email });

  if (existedUser) {
    return next(new ErrorHandler("User with this email already exists", 409));
  }
  const user = await UserSchema.create({
    name,
    email,
    avatar,
    password,
  });

  if (!user) {
    return next(new ErrorHandler("User not created", 400));
  }

  sendtoken(user, "User created successfully", 201, res);
});

exports.login_user = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if ([email, password].some((field) => !field?.trim())) {
    return next(new ErrorHandler("Email and password are required", 400));
  }

  const user = await UserSchema.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  sendtoken(user, "User logged in successfully", 200, res);
})

exports.logout_user = catchAsyncErrors(async (req, res, next) => {
  res.cookie("twk_fwc", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
})


