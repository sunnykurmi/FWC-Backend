const mongoose = require("mongoose");

const atithiRequestSchema = new mongoose.Schema({
    travelerName: String,
    travelerEmail: String,
    destinationCity: String,
    arrivalDate: Date,
    departureDate: Date,
    purpose: String,
    food:{
      enum: ["Veg", "Non-Veg", "Both"],
      type: String,
    },
    additionalNotes :{
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 30 * 24 * 60 * 60, // 30 days in seconds
    },
  });
  
module.exports = mongoose.model("AtithiRequest", atithiRequestSchema);

