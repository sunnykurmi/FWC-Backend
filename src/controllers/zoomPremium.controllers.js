const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path"); 
let { initImageKit } = require("../utils/imagekit.js");


const UserSchema = require("../models/user.schema.js");
const zoomSchema = require("../models/zoomPremium.schema.js");


/////////////////////////// ///////  zoom routes /////////////////////////////////////////////

// all zoom
exports.all_zoom = catchAsyncErrors(async (req, res, next) => {
  try {
    let zoom = await zoomSchema.find();
    res.status(200).json({
      success: true,
      message: " all zoom sent successfully",
      zoom,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Create Zoom Premium
exports.create_zoom = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userId, title, type, description, date ,audience } = req.body;
    const file = req.files?.thumbnail;  // Optional Thumbnail File
    let thumbnail = { fileId: "", url: "" };

    if (file) {
      const modifiedFileName = `zoom-${Date.now()}${path.extname(file.name)}`;
      const imagekit = initImageKit();
      const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
        folder: "zoom-premium-thumbnails",
      });
      thumbnail = { fileId, url };
    }

    const zoom = await zoomSchema.create({
      userId,
      title,
      type,
      description,
      date,
      audience,
      thumbnail,
    });

    res.status(200).json({
      success: true,
      message: "Zoom Premium created successfully",
      data: zoom,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
