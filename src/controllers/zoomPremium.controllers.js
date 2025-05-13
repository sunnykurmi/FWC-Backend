const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path"); 
let { initImageKit } = require("../utils/imagekit.js");
const nodemailer = require("nodemailer");


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



// Create Zoom Premium with confirmation email
exports.create_zoom = catchAsyncErrors(async (req, res, next) => {
  try {
    const { userId, title, type, description, date, audience, name } = req.body;
    const User = await UserSchema.findById(userId);
    if (!User) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const email = User.email;
    const file = req.files?.thumbnail;
    let thumbnail = { fileId: "", url: "" };

    // Upload thumbnail if exists
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

    // Save to DB
    const zoom = await zoomSchema.create({
      userId,
      title,
      type,
      description,
      date,
      audience,
      thumbnail,
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
      subject: "✅ Zoom Premium Session Submitted Successfully!",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; padding: 20px; color: #333;">
          <h2>Hi ${name || "Member"},</h2>
          <p>🎉 Thank you for submitting your Zoom Premium Session to First World Community!</p>
          
          <h3>📄 Session Details:</h3>
          <ul>
            <li><strong>Title:</strong> ${title}</li>
            <li><strong>Type:</strong> ${type}</li>
            <li><strong>Description:</strong> ${description}</li>
            <li><strong>Date:</strong> ${new Date(date).toLocaleString()}</li>
            <li><strong>Audience:</strong> ${audience}</li>
          </ul>

          <p>We have received your submission and our team will review it shortly.</p>
          
          <p>If you have any questions or need help, contact us at 
          <a href="mailto:info@fwc-india.org">info@fwc-india.org</a>.</p>

          <br />
          <p>Warm regards,</p>
          <p><strong>FWC Team</strong><br />
          🌐 <a href="https://firstworldcommunity.org">firstworldcommunity.org</a></p>
        </div>
      `,
    };

    await transport.sendMail(mailOptions);

    // Success response
    res.status(200).json({
      success: true,
      message: "Zoom Premium created successfully and confirmation email sent.",
      data: zoom,
    });
  } catch (error) {
    console.error("Zoom Creation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
});

