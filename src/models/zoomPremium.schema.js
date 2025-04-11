const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",  // Reference to User Schema
    required: true
  },
  title: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  audience: { type: String, required: true },
  thumbnail: {
    type: Object,
    default: {
      fileId: "",
      url: "",
    },
  },
});

module.exports = mongoose.model("zoom_premium", schema);
