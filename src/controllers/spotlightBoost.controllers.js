const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let { initImageKit } = require("../utils/imagekit.js");

const UserSchema = require("../models/user.schema.js");
const spotlightSchema = require("../models/spotlightBoost.schema.js");

/////////////////////////// ///////  event routes /////////////////////////////////////////////

// all event
exports.all_spotlight = catchAsyncErrors(async (req, res, next) => {
  try {
    let spotlight = await spotlightSchema.find();
    res.status(200).json({
      success: true,
      message: " all spotlight sent successfully",
      spotlight,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Spotlight Boost
exports.create_spotlight = catchAsyncErrors(async (req, res, next) => {
  try {
    const { name, promote, feature, userId, link } = req.body;
    const file = req.files?.file;
    let uploadedFile = { fileId: "", url: "" };

    if (file) {
      const modifiedFileName = `spotlight-${Date.now()}${path.extname(
        file.name
      )}`;
      const imagekit = initImageKit();
      const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
        folder: "spotlight-boost",
      });
      uploadedFile = { fileId, url };
    }

    const spotlight = await spotlightSchema.create({
      name,
      promote,
      feature,
      userId,
      link,
      file: uploadedFile,
    });

    res.status(200).json({
      success: true,
      message: "Spotlight Boost created successfully",
      data: spotlight,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Show Spotlight on Homepage
exports.show_on_homepage = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    const spotlight = await spotlightSchema.findById(id);
    if (!spotlight) {
      return next(new ErrorHandler("Spotlight not found", 404));
    }

    spotlight.showOnHome = true;
    await spotlight.save();

    res.status(200).json({
      success: true,
      message: "Spotlight set to show on homepage successfully",
      spotlight,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove Spotlight from Homepage
exports.remove_from_homepage = catchAsyncErrors(async (req, res, next) => {
  try {
    const { id } = req.params;

    const spotlight = await spotlightSchema.findById(id);
    if (!spotlight) {
      return next(new ErrorHandler("Spotlight not found", 404));
    }

    spotlight.showOnHome = false;
    await spotlight.save();

    res.status(200).json({
      success: true,
      message: "Spotlight removed from homepage successfully",
      spotlight,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});