const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
const nodemailer = require("nodemailer");
let imagekit = require("../utils/imagekit.js").initImageKit();

const MemberSchema = require("../models/member.schema.js");
const PaymentSchema = require("../models/payment.schema.js");
const userSchema = require("../models/user.schema.js");
const atithiRequestsSchema = require("../models/atithiRequests.schema.js");

exports.all_members = catchAsyncErrors(async (req, res, next) => {
  let members = await MemberSchema.find();
  if (!members) return next(new ErrorHandler("Members not found", 404));
  res.json({ success: true, members });
});

exports.create_member = catchAsyncErrors(async (req, res, next) => {
  const { email, fullName, contact, city, country } = req.body;
  const userId = req.user._id; 

  if (!email || !fullName || !contact || !city || !country || !userId) {
    return next(new ErrorHandler("All required fields must be provided", 400));
  }

  try {
    const schemaFields = Object.keys(MemberSchema.schema.paths);
    const requestBodyFields = Object.keys(req.body);

    requestBodyFields.forEach((field) => {
      if (!schemaFields.includes(field)) {
        MemberSchema.schema.add({
          [field]: { type: mongoose.Schema.Types.Mixed },
        });
      }
    });

    const memberData = { ...req.body, userId }; // Include userId in the member data
    const member = await MemberSchema.create(memberData);
    if (!member) {
      return next(new ErrorHandler("Member not created", 400));
    }

    const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      post: 465,
      auth: {
        user: process.env.MAIL_EMAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "First World Community",
      to: email,
      subject: "Your FWC Financial Aid Application is Under Review 🚀",
      html: `
         <div style="text-align: start; width: 80%; font-family: Arial, sans-serif; color: #333; font-size: 1.2vw; margin: auto; padding: 20px; border: 2px solid #333; border-radius: 10px;">
      <p>
        Dear <b>${email}</b>,
        <br /><br />
        Thank you for applying for FWC Membership Financial Aid and for showing interest in being part of First World Community (FWC). We truly appreciate your enthusiasm and believe in your potential to make an impact!
        <br /><br />
        At FWC, you are valuable, and your journey matters. As a community-driven, not-for-profit organization, we are committed to supporting entrepreneurs and changemakers like you. However, to ensure fairness and transparency, we follow a structured review process before approving financial aid.
        <br /><br />
        <b>What Happens Next?</b>
        <br />
        ✅ Our team is reviewing your application and profile to ensure all details are complete.
        <br />
        ✅ If approved, you will receive your membership confirmation within 12 hours.
        <br />
        ✅ If rejected, your application fee will be refunded promptly.
        <br /><br />
        📌 <b>Important:</b> Please make sure all details in your application are accurate, as incomplete applications may lead to delays or rejection.
        <br /><br />
        We are excited about the possibility of welcoming you to FWC! Regardless of the outcome, we are always here to support, guide, and empower you. Because at FWC, we believe in impact, community, and family.
        <br /><br />
        Stay tuned for your application results, and thank you for being part of this journey! 🚀
        <br /><br />
        Best Regards,
        <br />
        <b>FWC Membership Team</b>
        <br /><br />
        🌍 <i>One World, One Community, One Future</i>
        <br />
        📩 <a href="mailto:info@fwc-india.org">Info@fwc-india.org</a> | 🌐 <a href="https://firstworldcommunity.org" target="_blank">firstworldcommunity.org</a>
      </p>
    </div>
      `,
    };

    transport.sendMail(mailOptions, (err, info) => {
      if (err) return next(new ErrorHandler(err, 500));
      res
        .status(200)
        .json({ message: "Payment successful", status: payment.status });
    });

    res.json({ success: true, message: "Member created successfully" });
  } catch (error) {
    console.error("Error creating member:", error);
    res.status(500).json({ message: error.message });
  }
});

// create payment
exports.createpayment = catchAsyncErrors(async (req, res, next) => {
  try {
    const { email, fullName, contact, city, country, amount } = req.body;

    if (!email || !fullName || !contact || !city || !country || !amount) {
      return next(
        new ErrorHandler("All required fields must be provided", 400)
      );
    }

    // const existedMember = await MemberSchema.findOne({ email });

    // if (existedMember) {
    //   return next(new ErrorHandler("Member with this email already exists", 409));
    // }

    const schemaFields = Object.keys(MemberSchema.schema.paths);
    const requestBodyFields = Object.keys(req.body);

    requestBodyFields.forEach((field) => {
      if (!schemaFields.includes(field)) {
        MemberSchema.schema.add({
          [field]: { type: mongoose.Schema.Types.Mixed },
        });
      }
    });

    const member = await MemberSchema.create(req.body);

    if (!member) {
      return next(new ErrorHandler("Member not created", 400));
    }

    let order;

    try {
      order = await member.createOrder();
    } catch (error) {
      return next(
        new ErrorHandler("Order creation failed: " + error.message, 500)
      );
    }

    if (!order) {
      return next(new ErrorHandler("Order not created", 500));
    }

    // Save initial payment details without paymentId
    const payment = new PaymentSchema({
      orderId: order.id,
      form: member._id,
      useremail: email,
      amount: order.amount,
      status: "created",
    });
    await payment.save();

    // console.log("order", order);
    res.status(200).json(order);
  } catch (error) {
    console.log("error create payment :", error);
    res.status(500).json({ message: error.message });
  }
});

// verify payment
exports.verifypayment = catchAsyncErrors(async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const paymentDetails = {
      razorpay_order_id: razorpay_order_id,
      razorpay_payment_id: razorpay_payment_id,
      razorpay_signature: razorpay_signature,
    };

    const isValid = MemberSchema.verifyPayment(paymentDetails);
    if (isValid) {
      // Update payment details
      const payment = await PaymentSchema.findOne({
        orderId: razorpay_order_id,
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment record not found" });
      }

      payment.paymentId = razorpay_payment_id;
      payment.signature = razorpay_signature;
      payment.status = "paid";
      payment.expireAt = undefined;

      await payment.save();
      res.redirect(
        `${process.env.HOST}/partner/paymentsuccess/${razorpay_payment_id}`
      );
    } else {
      // Update payment status to failed
      const payment = await PaymentSchema.findOne({
        orderId: razorpay_order_id,
      });

      if (!payment) {
        return res.status(404).json({ message: "Payment record not found" });
      }

      payment.status = "failed";
      await payment.save();

      res.status(400).json({
        message: "Invalid payment signature",
        status: payment.status,
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error verifying payment: " + error.message });
  }
});

//paymentsuccess rout for send mail to user

exports.paymentsuccess = catchAsyncErrors(async (req, res, next) => {
  const user_email = req.body;
  try {
    const payment = await PaymentSchema.findOne({ paymentId: req.params.id });
    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }
    const transport = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      post: 465,
      auth: {
        user: process.env.MAIL_EMAIL_ADDRESS,
        pass: process.env.MAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: "First World Community",
      to: user_email.email,
      subject: "Your FWC Membership Application Is Under Review 🚀",
      html: `
            <div style="text-align: start; width: 80%; font-family: Arial, sans-serif; color: #333; font-size: 1.2vw; margin: auto; padding: 20px; border: 2px solid #333; border-radius: 10px;">
      <p>
        Dear <b>${user_email.email}</b>,
        <br /><br />
        Thank you for applying for FWC Membership and for showing interest in being part of First World Community (FWC). We truly appreciate your enthusiasm and believe in your potential to make an impact!
        <br /><br />
        At FWC, you are valuable, and your journey matters. As a community-driven organization, we are committed to supporting entrepreneurs and changemakers like you. However, to ensure fairness and transparency, we follow a structured review process before approving.
        <br /><br />
        <b>What Happens Next?</b>
        <br />
        ✅ Our team is reviewing your application and profile to ensure all details are complete.
        <br />
        ✅ If approved, you will receive your membership confirmation within 12 hours.
        <br />
        ✅ If rejected, your application fee will be refunded promptly.
        <br /><br />
        📌 <b>Important:</b> Please make sure all details in your application are accurate, as incomplete applications may lead to delays or rejection.
        <br /><br />
        We are excited about the possibility of welcoming you to FWC! Regardless of the outcome, we are always here to support, guide, and empower you. Because at FWC, we believe in impact, community, and family.
        <br /><br />
        Stay tuned for your application results, and thank you for being part of this journey! 🚀
        <br /><br />
        Best Regards,
        <br />
        <b>FWC Membership Team</b>
        <br /><br />
        🌍 <i>One World, One Community, One Future</i>
        <br />
        📩 <a href="mailto:info@fwc-india.org">Info@fwc-india.org</a> | 🌐 <a href="https://firstworldcommunity.org" target="_blank">firstworldcommunity.org</a>
      </p>
    </div>
        `,
    };

    transport.sendMail(mailOptions, (err, info) => {
      if (err) return next(new ErrorHandler(err, 500));
      res
        .status(200)
        .json({ message: "Payment successful", status: payment.status });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
});

///rout to approve member
exports.approve_member = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;

  // Find user by email
  const user = await userSchema.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found", 404));

  // Find member details
  const member = await MemberSchema.findOne({ email });
  if (!member) return next(new ErrorHandler("Member details not found", 404));

  // Update user role and add member details
  user.role = "member";
  user.city = member.city;
  user.country = member.country;
  user.contact = member.contact;
  user.linkedinProfile = member.linkedinProfile;
  await user.save();

  const transport = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    post: 465,
    auth: {
      user: process.env.MAIL_EMAIL_ADDRESS,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "First World Community",
    to: email,
    subject:
      "🎉 Welcome to First World Community – Your Application is Approved! 🚀",
    html: `
         <div style="text-align: start; width: 80%; font-family: Arial, sans-serif; color: #333; font-size: 1.2vw; margin: auto; padding: 20px; border: 2px solid #333; border-radius: 10px;">
      <p>
        Dear <b>${user.name}</b>,
        <br /><br />
        Congratulations! 🎉 We are thrilled to inform you that your FWC Membership application has been approved! You are now officially a part of First World Community (FWC), a powerful network of entrepreneurs, business leaders, and innovators committed to growth, collaboration, and impact.
        <br /><br />
        At FWC, we support, guide, and connect our members to unlock new opportunities, scale businesses, and drive meaningful change. Our team will now proceed with onboarding you into the community.
        <br /><br />
        🔥 <b>What Happens Next?</b>
        <br />
        ✅ <b>Step 1: WhatsApp Group Onboarding</b><br />
        Our team will add you to exclusive FWC WhatsApp groups, where you’ll connect with members, discuss opportunities, and get real-time updates.
        <br /><br />
        ✅ <b>Step 2: Introduce Yourself</b><br />
        Once added, please share a short introduction:
        <br />
        📌 Your Name<br />
        📌 Your Business/Industry<br />
        📌 Your Goals & How FWC Can Support You
        <br /><br />
        ✅ <b>Step 3: Connect & Engage</b><br />
        Network with fellow members and share insights.<br />
        Ask for help, guidance, and collaborations.<br />
        Participate in FWC events, masterclasses, and funding sessions.
        <br /><br />
        ✅ <b>Step 4: Follow FWC Community Guidelines</b><br />
        To maintain a productive, positive, and impactful environment, all members must adhere to our rules & policies:
        <br />
        🔹 Be respectful & professional in all interactions.<br />
        🔹 No spamming, promotions, or unsolicited sales pitches.<br />
        🔹 Actively participate in discussions & events.<br />
        🔹 Build meaningful connections and contribute to the community.
        <br /><br />
        🌍 <b>Welcome to a Global Community of Changemakers!</b>
        <br />
        We are excited to have you on board and look forward to seeing you grow, succeed, and make an impact with FWC! If you have any questions or need support, our team is always here to help.
        <br /><br />
        🚀 <b>Welcome to First World Community – One World, One Community, One Future!</b>
        <br /><br />
        Best Regards,
        <br />
        <b>FWC Membership Team</b>
        <br /><br />
        📩 <a href="mailto:info@fwc-india.org">Info@fwc-india.org</a> | 🌐 <a href="https://firstworldcommunity.org" target="_blank">firstworldcommunity.org</a>
      </p>
    </div>
      `,
  };

  transport.sendMail(mailOptions, (err, info) => {
    if (err) return next(new ErrorHandler(err, 500));
    res
      .status(200)
      .json({ message: "Payment successful", status: payment.status });
  });

  res.json({ success: true, message: "Member approved successfully" });
});

// rout to remove member
exports.remove_member = catchAsyncErrors(async (req, res, next) => {
  const { email } = req.body;
  const user = await userSchema.findOne({ email });
  if (!user) return next(new ErrorHandler("User not found", 404));
  user.role = "user";
  await user.save();
  res.json({ success: true, message: "Member removed successfully" });
});

///rout to get all members payments
exports.all_members_payments = catchAsyncErrors(async (req, res, next) => {
  let payments = await PaymentSchema.find().populate("form");
  if (!payments) return next(new ErrorHandler("Payments not found", 404));
  res.json({ success: true, payments });
});

//  route for fwc atithi
exports.submit_fwc_athithi_request = catchAsyncErrors(
  async (req, res, next) => {
    try {
      const {
        travelerName,
        travelerEmail,
        destinationCity,
        arrivalDate,
        departureDate,
        purpose,
        food,
        additionalNotes,
      } = req.body;

      // Ensure the user is logged in
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized: Please log in" });
      }

      // Ensure the user is a member
      if (req.user.role !== "member") {
        return res.status(403).json({ message: "Only members can apply" });
      }

      // Save the travel request
      const newRequest = new atithiRequestsSchema({
        travelerName,
        travelerEmail,
        destinationCity,
        arrivalDate,
        departureDate,
        purpose,
        food,
        additionalNotes,
      });
      await newRequest.save();

      // Find members in the destination city from userSchema where role is "member"
      const membersInCity = await userSchema.find({
        role: "member",
        city: destinationCity.toLowerCase(),
      });

      if (membersInCity.length === 0) {
        return res
          .status(404)
          .json({ message: "No members found in this city" });
      }

      const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        post: 465,
        auth: {
          user: process.env.MAIL_EMAIL_ADDRESS,
          pass: process.env.MAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "First World Community",
        bcc: membersInCity.map((member) => member.email),
        subject: `Accommodation Request – FWC Atithi Program: ${travelerName} is visiting ${destinationCity}`,
        html: `
        <div style="font-family: Arial, sans-serif; color: #333; font-size: 16px; line-height: 1.6;">
          <p>Dear Member,</p>

          <p>We hope this message finds you well.</p>

          <p>
            This email is to inform you that <strong>${travelerName}</strong> will be visiting <strong>${destinationCity}</strong> from 
            <strong>${arrivalDate}</strong> to <strong>${departureDate}</strong> and has expressed interest in connecting with the local 
            community during their stay. The primary purpose of their visit is <strong>${purpose}</strong>.
          </p>

          <p>
            To enhance their experience and foster meaningful connections, we are reaching out to our trusted network in 
            <strong>${destinationCity}</strong> to offer support. If you are available and open to hosting or assisting 
            <strong>${travelerName}</strong>, we kindly ask you to confirm your accommodation or assistance through this email.
          </p>

          <h3 style="color: #2C3E50;">Important Details:</h3>
          <ul>
            <li><strong>Visitor’s Name:</strong> ${travelerName}</li>
            <li><strong>Duration of Stay:</strong> ${arrivalDate} to ${departureDate}</li>
            <li><strong>Purpose of Visit:</strong> ${purpose}</li>
            <li><strong>Dietary Preferences:</strong> ${food}</li>
            <li><strong>Additional Notes:</strong> ${additionalNotes}</li>
          </ul>

          <p>
            If you are willing to accommodate or assist <strong>${travelerName}</strong>, kindly reply to this email with your confirmation.
            Once approved, we will provide both parties’ contact details to facilitate further communication and coordination.
          </p>

          <p>We appreciate your support in making <strong>FWC Atithi</strong> a success and thank you for your willingness to contribute 
          to this valuable community initiative.</p>

          <p>We look forward to hearing from you soon.</p>

          <p><strong>Best regards,</strong></p>
          <p><strong>FWC Atithi Program Coordinator</strong><br>
          <strong>First World Community (FWC)</strong></p>
        </div>`,
      };

      transport.sendMail(mailOptions, (err, info) => {
        if (err) return next(new ErrorHandler(err, 500));
        res.status(200).json({
          message: "Atithi request submitted and emails sent!",
          success: true,
        });
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// route for all atithi
exports.all_fwc_atithi = catchAsyncErrors(async (req, res, next) => {
  console.log("all fwc atithi");
  let atithiRequests = await atithiRequestsSchema.find();
  if (!atithiRequests)
    return next(new ErrorHandler("Atithi requests not found", 404));
  res.json({ success: true, atithiRequests });
});
