const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path"); 
let { initImageKit } = require("../utils/imagekit.js");


const UserSchema = require("../models/user.schema.js");
const eventSchema = require("../models/event.schema.js");


/////////////////////////// ///////  event routes /////////////////////////////////////////////

// all event
exports.all_event = catchAsyncErrors(async (req, res, next) => {
  try {
    let event = await eventSchema.find();
    res.status(200).json({
      success: true,
      message: " all event sent successfully",
      event,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// Create event
exports.create_event = catchAsyncErrors(async (req, res, next) => {
  try {
    const { date, title, time, register_link, location } = req.body;
    const file = req.files?.thumbnail;
    let thumbnail = { fileId: "", url: "" };

    if (file) {
      const modifiedFileName = `event-${Date.now()}${path.extname(file.name)}`;
      const imagekit = initImageKit();
      const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
        folder: "exclusive-event-thumbnails",
      });
      thumbnail = { fileId, url };
    }

    let event = await eventSchema.create({
      date,
      title,
      time,
      register_link,
      location,
      thumbnail,
    });
    event.save();
    
    res.status(200).json({
      success: true,
      message: "Event created successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update event
exports.update_event = catchAsyncErrors(async (req, res, next) => {
  try {
    const { date, title, time, register_link, location, eventid } = req.body;
    let event = await eventSchema.findById(eventid);
    if (!event) {
      return next(new ErrorHandler("Event not found", 404));
    }

    const file = req.files?.thumbnail;
    const imagekit = initImageKit();
    let thumbnail = event.thumbnail;

    if (file) {
      if (event.thumbnail.fileId) {
        await imagekit.deleteFile(event.thumbnail.fileId);
      }
      const modifiedFileName = `event-${Date.now()}${path.extname(file.name)}`;
      const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
        folder: "exclusive-event-thumbnails",
      });
      thumbnail = { fileId, url };
    }

    event.date = date;
    event.title = title;
    event.time = time;
    event.register_link = register_link;
    event.location = location;
    event.thumbnail = thumbnail;

    await event.save();
    res.status(200).json({
      success: true,
      message: "Event updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete event
exports.delete_event = catchAsyncErrors(async (req, res, next) => {
  try {
    const { eventid } = req.body;
    let event = await eventSchema.findById(eventid);
    if (!event) {
      return next(new ErrorHandler("Event not found", 404));
    }

    const imagekit = initImageKit();
    if (event.thumbnail.fileId) {
      await imagekit.deleteFile(event.thumbnail.fileId);
    }

    await eventSchema.findByIdAndDelete(eventid);
    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
