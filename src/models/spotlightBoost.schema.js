const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",  // Reference to User Schema
    required: true
  },
  name: { type: String, required: true },
  promote: { type: String, required: true },
  feature: { type: String, required: true },
  file: {
    type: Object,
    default: {
      fileId: "",
      url: "",
    },
  },
});

module.exports = mongoose.model("Spotlight_Boost", schema);
