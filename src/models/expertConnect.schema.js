const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "member",
    required: true,
  },
  matchingStatus: {
    type: String,
    enum: ["pending", "matched"],
    default: "pending",
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
    expires: 0, 
  },
});

module.exports = mongoose.model("expert_connect", schema);
