const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let { initImageKit } = require("../utils/imagekit.js");
const nodemailer = require("nodemailer");


const UserSchema = require("../models/user.schema.js");
const eventSchema = require("../models/event.schema.js");
const yuvaSchema = require("../models/yuvaShakti.schema.js");


/////////////////////////// ///////  all yuva skati  /////////////////////////////////////////////

exports.all_yuvaShakti = catchAsyncErrors(async (req, res, next) => {
  try {
    let yuvaShakti = await yuvaSchema.find();
    res.status(200).json({
      success: true,
      message: "all yuvaShakti sent successfully",
      yuvaShakti,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/////////////////////////// ///////  create yuva skati  /////////////////////////////////////////////

exports.create_yuvaShakti = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      userId,
      name,
      education,
      city,
      whatsappNumber,
      description,
      country,
      socialmedia,
    } = req.body;

    if (!userId || !name || !education || !city || !country || !whatsappNumber || !description) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const User = await UserSchema.findById(userId);
    if (!User) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const email = User.email;

    // Save to DB
    const yuvaShakti = await yuvaSchema.create(req.body);

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
      subject: "✅ Yuva Shakti Submission Successful!",
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 16px; padding: 20px; color: #333;">
          <h2>Hi ${name},</h2>
          <p>🎉 Thank you for submitting your details for the <strong>Yuva Shakti</strong> initiative at First World Community!</p>

          <h3>📄 Submitted Details:</h3>
          <ul>
            <li><strong>Education:</strong> ${education}</li>
            <li><strong>City:</strong> ${city}</li>
            <li><strong>Country:</strong> ${country}</li>
            <li><strong>WhatsApp:</strong> ${whatsappNumber}</li>
            <li><strong>Description:</strong> ${description}</li>
            ${socialmedia ? `<li><strong>Social Media:</strong> ${socialmedia}</li>` : ""}
          </ul>

          <p>We appreciate your interest in making an impact. Our team will review your submission and get in touch if needed.</p>

          <p>If you have any questions, please email us at 
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
      message: "Yuva Shakti created successfully and confirmation email sent.",
      yuvaShakti,
    });
  } catch (error) {
    console.error("Yuva Shakti Error:", error);
    res.status(500).json({ message: error.message });
  }
});

