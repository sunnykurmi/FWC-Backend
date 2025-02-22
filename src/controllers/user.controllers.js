const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let imagekit = require("../utils/imagekit.js").initImageKit();

const UserSchema = require("../models/user.schema.js");
const { oauth2Client } = require("../utils/googleConfig.js");
const axios = require("axios");


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

exports.google_auth = catchAsyncErrors(async (req, res, next) => {
  let code = req.query.code;
  if (!code) {
      return res.status(400).json({ message: "No code provided" });
  }
  let googleRes;
  try {
      googleRes = await oauth2Client.getToken(code);
  } catch (error) {
      return res.status(401).json({ message: "Failed to get token from Google API" });
  }

  oauth2Client.setCredentials(googleRes.tokens);

  let userRes;
  try {
      userRes = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`);
  } catch (error) {
      return res.status(401).json({ message: "Failed to fetch user info from Google API" });
  }

  const { email, name, picture } = userRes.data;

  let user;
  try {
      user = await UserSchema.findOne({ email });
      if (!user) {
          user = new UserSchema({
              name,
              email,
              avatar: {
                  fileId: "",
                  url: picture
              }
          });
          await user.save();
      } else {

      }
  } catch (error) {
      return res.status(500).json({ message: "Failed to find or create user" });
  }
  try {
    sendtoken(user, "User logged in successfully", 200, res);
  } catch (error) {
      return res.status(500).json({ message: "Failed to send token" });
  }
});

