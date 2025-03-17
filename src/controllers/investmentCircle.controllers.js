const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path"); 
let { initImageKit } = require("../utils/imagekit.js");


const UserSchema = require("../models/user.schema.js");
const InvestmentCircleSchema = require("../models/investorCircle.schema.js");


/////////////////////////// ///////  investment circle routes /////////////////////////////////////////////

exports.all_investment_circle = catchAsyncErrors(async (req, res, next) => {
  try {
    let investmentCircle = await InvestmentCircleSchema.find();
    res.status(200).json({
      success: true,
      message: "All investment circle",
      investmentCircle,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
})

exports.create_investment_circle = catchAsyncErrors(async (req, res, next) => {
  try {
    const {
      name,
      website,
      description,
      socialMedia,
      valuation,
      incorporate,
      incorporationNumber,
      investmentDetails,
      funding,
      fundingUse,
      usp
    } = req.body;

    const newInvestmentCircle = new InvestmentCircleSchema({
      name,
      website,
      description,
      socialMedia,
      valuation,
      incorporate,
      incorporationNumber,
      investmentDetails,
      funding,
      fundingUse,
      usp
    });

    await newInvestmentCircle.save();

    res.status(201).json({
      success: true,
      message: "Investment circle created successfully",
      investmentCircle: newInvestmentCircle
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
});