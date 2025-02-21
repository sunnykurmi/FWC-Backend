const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let imagekit = require("../utils/imagekit.js").initImageKit();

const MemberSchema = require("../models/member.schema.js");

exports.all_members = catchAsyncErrors(async (req, res, next) => {
  let members = await MemberSchema.find()
  if (!members) return next(new ErrorHandler("Members not found", 404));
  res.json({ success: true, members });
})


exports.create_member = catchAsyncErrors(async (req, res, next) => {

  const { email, fullName, dob, whatsappNumber, mobileNumber, city, country } = req.body;

  if (!email || !fullName || !dob || !whatsappNumber || !mobileNumber || !city || !country) {
    return next(new ErrorHandler("All required fields must be provided", 400));
  }

  const existedMember = await MemberSchema.findOne({ email });

  if (existedMember) {
    return next(new ErrorHandler("Member with this email already exists", 409));
  }

  const schemaFields = Object.keys(MemberSchema.schema.paths);
  const requestBodyFields = Object.keys(req.body);

  requestBodyFields.forEach(field => {
    if (!schemaFields.includes(field)) {
      MemberSchema.schema.add({ [field]: { type: mongoose.Schema.Types.Mixed } });
    }
  });

  const member = await MemberSchema.create(req.body);

  if (!member) {
    return next(new ErrorHandler("Member not created", 400));
  }

  res.json({ success: true, message: "Member created successfully" });

});