const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let { initImageKit } = require("../utils/imagekit.js");
const MasterClass = require("../models/masterClass.schema.js");

const UserSchema = require("../models/user.schema.js");

exports.all_master_class = catchAsyncErrors(async (req, res, next) => {
  try {
    let masterclass = await MasterClass.find();
    res.status(200).json({
      success: true,
      message: "All Masterclass",
      masterclass,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create class
exports.create_master_class = catchAsyncErrors(async (req, res, next) => {
  try {
    const { date, title, time, link, organisedBy } = req.body;
    const file = req.files.thumbnail;
    const modifiedFileName = `masterclass-${Date.now()}${path.extname(
      file.name
    )}`;

    // Initialize ImageKit
    const imagekit = initImageKit();

    // Upload the thumbnail to ImageKit
    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedFileName,
      folder: "masterclass-thumbnails",
    });

    let masterclass = await MasterClass.create({
      date,
      title,
      time,
      thumbnail: { fileId, url },
      link,
      organisedBy,
    });
    await masterclass.save();
    res.status(200).json({
      success: true,
      message: "Masterclass created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update class
exports.update_master_class = catchAsyncErrors(async (req, res, next) => {
  try {
    const { date, title, time, link, masterclassid,organisedBy } = req.body;
    let masterclass = await MasterClass.findById(masterclassid);
    if (!masterclass) {
      return next(new ErrorHandler("Masterclass not found", 404));
    }

    const file = req.files.thumbnail;
    const modifiedFileName = `masterclass-${Date.now()}${path.extname(
      file.name
    )}`;

    // Initialize ImageKit
    const imagekit = initImageKit();

    // Delete the old thumbnail if it exists
    if (masterclass.thumbnail.fileId) {
      await imagekit.deleteFile(masterclass.thumbnail.fileId);
    }

    // Upload the new thumbnail to ImageKit
    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedFileName,
      folder: "masterclass-thumbnails",
    });

    masterclass.date = date;
    masterclass.title = title;
    masterclass.time = time;
    masterclass.thumbnail = { fileId, url };
    masterclass.link = link;
    masterclass.organisedBy = organisedBy;

    await masterclass.save();
    res.status(200).json({
      success: true,
      message: "Masterclass updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// delete class
exports.delete_master_class = catchAsyncErrors(async (req, res, next) => {
  try {
    const { masterclassid } = req.body;
    let masterclass = await MasterClass.findByIdAndDelete({
      _id: masterclassid,
    });
    if (!masterclass) {
      return next(new ErrorHandler("masterclass not found", 404));
    }
    res.status(200).json({
      success: true,
      message: "masterclass deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
