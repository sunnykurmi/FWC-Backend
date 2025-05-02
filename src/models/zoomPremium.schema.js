const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  title: { type: String, required: true },
  type: { type: String, required: true },
  description: { type: String, required: true },
  audience: { type: String, required: true },
  date: { type: String, required: true }, // original date field (can be ISO string)
  
  thumbnail: {
    type: Object,
    default: {
      fileId: "",
      url: "",
    },
  },

  expireAt: {
    type: Date,
    default: function () {
      const eventDate = new Date(this.date);
      return eventDate;
    },
    index: { expires: 0 } // TTL: 0 seconds after 'expireAt'
  }
});

module.exports = mongoose.model("zoom_premium", schema);
