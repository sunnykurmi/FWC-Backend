const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let imagekit = require("../utils/imagekit.js").initImageKit();

const UserSchema = require("../models/user.schema.js");


// approve admin role to user
exports.approve_admin = catchAsyncErrors(async (req, res, next) => {
  const userid = req.params.id;
  const user = await UserSchema.findById(userid)
  user.role = "admin";
  await user.save();
  res.json({ success: true, message: "admin role assigned successfully" });
})

// remove admin role to user
exports.remove_admin = catchAsyncErrors(async (req, res, next) => {
  const userid = req.params.id;
  const user = await UserSchema.findById(userid)
  user.role = "user";
  await user.save();
  res.json({ success: true, message: "admin role removed successfully" });
}
)