const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let { initImageKit } = require("../utils/imagekit.js");


const UserSchema = require("../models/user.schema.js");
const eventSchema = require("../models/event.schema.js");
const yuvaSchema = require("../models/yuvaShakti.schema.js");


/////////////////////////// ///////  all yuva skati  /////////////////////////////////////////////

exports.all_yuvaShakti = catchAsyncErrors(async (req, res, next) => {
  try {
    let yuvaShakti = await yuvaSchema.find();
    res.status(200).json({
      success: true,
      message: " all yuvaShakti sent successfully",
      yuvaShakti,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/////////////////////////// ///////  create yuva skati  /////////////////////////////////////////////

exports.create_yuvaShakti = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userId, name, education, city, whatsappNumber, description, country, socialmedia } = req.body;

    if (!userId || !name || !education || !city || !country || !whatsappNumber || !description) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    let yuvaShakti = await yuvaSchema.create(req.body);
    res.status(200).json({
      success: true,
      message: "yuvaShakti created successfully",
      yuvaShakti,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
