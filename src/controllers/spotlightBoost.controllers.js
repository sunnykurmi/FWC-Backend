const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let { initImageKit } = require("../utils/imagekit.js");
const nodemailer = require("nodemailer");

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

    // Get user
    const User = await UserSchema.findById(userId);
    if (!User) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const email = User.email;

    // Upload file if present
    const file = req.files?.file;
    let uploadedFile = { fileId: "", url: "" };

    if (file) {
      const modifiedFileName = `spotlight-${Date.now()}${path.extname(file.name)}`;
      const imagekit = initImageKit();
      const { fileId, url } = await imagekit.upload({
        file: file.data,
        fileName: modifiedFileName,
        folder: "spotlight-boost",
      });
      uploadedFile = { fileId, url };
    }

    // Create spotlight boost in DB
    const spotlight = await spotlightSchema.create({
      name,
      promote,
      feature,
      userId,
      link,
      file: uploadedFile,
    });

    // Send email confirmation
    const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_EMAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "First World Community <no-reply@fwc-india.org>",
      to: email,
      subject: "✅ Spotlight Boost Submitted Successfully!",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; padding: 20px; color: #333;">
          <h2>Hi ${name || "Member"},</h2>
          <p>🎉 Thank you for submitting your <strong>Spotlight Boost</strong> to First World Community!</p>

          <h3>🚀 Boost Details:</h3>
          <ul>
            <li><strong>Promote:</strong> ${promote}</li>
            <li><strong>Feature:</strong> ${feature}</li>
            <li><strong>Link:</strong> ${link || "N/A"}</li>
          </ul>

          <p>We have received your submission and our team will review it shortly.</p>

          <p>If you have any questions or need assistance, feel free to reach out to us at 
          <a href="mailto:info@fwc-india.org">info@fwc-india.org</a>.</p>

          <br />
          <p>Warm regards,</p>
          <p><strong>FWC Team</strong><br />
          🌐 <a href="https://firstworldcommunity.org">firstworldcommunity.org</a></p>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);

    // Final response
    res.status(200).json({
      success: true,
      message: "Spotlight Boost created successfully and confirmation email sent.",
      data: spotlight,
    });
  } catch (error) {
    console.error("Spotlight Creation Error:", error);
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