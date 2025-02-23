const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
const nodemailer = require("nodemailer");
let imagekit = require("../utils/imagekit.js").initImageKit();

const MemberSchema = require("../models/member.schema.js");
const PaymentSchema = require("../models/payment.schema.js");

exports.all_members = catchAsyncErrors(async (req, res, next) => {
  let members = await MemberSchema.find()
  if (!members) return next(new ErrorHandler("Members not found", 404));
  res.json({ success: true, members });
})

exports.create_member = catchAsyncErrors(async (req, res, next) => {
  const { email, fullName, contact , city, country } = req.body;

  if (!email || !fullName || !contact || !city || !country) {
    return next(new ErrorHandler("All required fields must be provided", 400));
  }

  // const existedMember = await MemberSchema.findOne({ email });

  // if (existedMember) {
  //   return next(new ErrorHandler("Member with this email already exists", 409));
  // }

  const schemaFields = Object.keys(MemberSchema.schema.paths);
  const requestBodyFields = Object.keys(req.body);

  requestBodyFields.forEach(field => {
    if (!schemaFields.includes(field)) {
      MemberSchema.schema.add({ [field]: { type: mongoose.Schema.Types.Mixed } });
    }
  });

  const member = await MemberSchema.create(req.body);

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
    subject: "Your FWC Membership Application Is Under Review 🚀",
    html: `
          <div style="text-align: start; width: 80%; font-family: Arial, sans-serif; color: #333; font-size: 1.2vw; margin: auto; padding: 20px; border: 2px solid #333; border-radius: 10px;">
    <p>
      Dear <b>${email}</b>,
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

  res.json({ success: true, message: "Member created successfully" });

});



// create payment
exports.createpayment = catchAsyncErrors(async (req, res, next) => {
  try {
     
  const { email, fullName, contact , city, country } = req.body;

  if (!email || !fullName || !contact || !city || !country) {
    return next(new ErrorHandler("All required fields must be provided", 400));
  }

  // const existedMember = await MemberSchema.findOne({ email });

  // if (existedMember) {
  //   return next(new ErrorHandler("Member with this email already exists", 409));
  // }

  const schemaFields = Object.keys(MemberSchema.schema.paths);
  const requestBodyFields = Object.keys(req.body);

  requestBodyFields.forEach(field => {
    if (!schemaFields.includes(field)) {
      MemberSchema.schema.add({ [field]: { type: mongoose.Schema.Types.Mixed } });
    }
  });

  const member = await MemberSchema.create(req.body);

  if (!member) {
    return next(new ErrorHandler("Member not created", 400));
  }
    const order = await member.createOrder();

    // Save initial payment details without paymentId
    const payment = new PaymentSchema({
      orderId: order.id,
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
      const payment = await PaymentSchema.findOne({ orderId: razorpay_order_id });

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
      const payment = await PaymentSchema.findOne({ orderId: razorpay_order_id });

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
