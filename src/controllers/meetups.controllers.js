const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path"); 
let { initImageKit } = require("../utils/imagekit.js");


const UserSchema = require("../models/user.schema.js");
const meetupSchema = require("../models/meetup.schema.js");


/////////////////////////// ///////  meetups routes /////////////////////////////////////////////

// all meetups
exports.all_meetup = catchAsyncErrors(async (req, res, next) => {
  try {
    let meetups = await meetupSchema.find();
    res.status(200).json({
      success: true,
      message: " all meetups sent successfully",
      meetups,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Create meetups
exports.create_meetup = catchAsyncErrors(async (req, res, next) => {
  try {
    const { date, title, time, mode, link, organisedBy, type } = req.body;
    const file = req.files.thumbnail;
    const modifiedFileName = `meetup-${Date.now()}${path.extname(file.name)}`;

    // Initialize ImageKit
    const imagekit = initImageKit();

    // Upload the thumbnail to ImageKit
    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedFileName,
      folder: "weekly-meetup-thumbnails",
    });

    let meetup = await meetupSchema.create({
      date,
      title,
      time,
      mode,
      link,
      organisedBy,
      type,
      thumbnail: { fileId, url },
    });
    await meetup.save();
    res.status(200).json({
      success: true,
      message: "meetup created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Update meetup
exports.update_meetup = catchAsyncErrors(async (req, res, next) => {
  try {
    const { date, title, time, mode, link, meetupid, type, organisedBy } = req.body;
    let meetup = await meetupSchema.findById(meetupid);
    if (!meetup) {
      return next(new ErrorHandler("meetup not found", 404));
    }

    const file = req.files.thumbnail;
    const modifiedFileName = `meetup-${Date.now()}${path.extname(file.name)}`;

    // Initialize ImageKit
    const imagekit = initImageKit();

    // Delete the old thumbnail if it exists
    if (meetup.thumbnail.fileId) {
      await imagekit.deleteFile(meetup.thumbnail.fileId);
    }

    // Upload the new thumbnail to ImageKit
    const { fileId, url } = await imagekit.upload({
      file: file.data,
      fileName: modifiedFileName,    
        folder: "weekly-meetup-thumbnails",

    });

    meetup.date = date;
    meetup.title = title;
    meetup.time = time;
    meetup.mode = mode;
    meetup.link = link;
    meetup.type = type;
    meetup.organisedBy = organisedBy;
    meetup.thumbnail = { fileId, url };

    await meetup.save();
    res.status(200).json({
      success: true,
      message: "meetup updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// delete meetup
exports.delete_meetup = catchAsyncErrors(async (req, res, next) => {
  try {
    const { meetupid } = req.body;
    let meetup = await meetupSchema.findById(meetupid);
    if (!meetup) {
      return next(new ErrorHandler("meetup not found", 404));
    }

    // Initialize ImageKit
    const imagekit = initImageKit();

    // Delete the thumbnail from ImageKit if it exists
    if (meetup.thumbnail.fileId) {
      await imagekit.deleteFile(meetup.thumbnail.fileId);
    }

    await meetupSchema.findByIdAndDelete(meetupid);

    res.status(200).json({
      success: true,
      message: "meetup deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});