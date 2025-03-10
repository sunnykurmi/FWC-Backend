const mongoose = require("mongoose");

const masterclassmodel = new mongoose.Schema({
  date: { type: String, required: true },
  title: { type: String, required: true },
  time: { type: String, required: true },
  mode: { type: String, default: "online" },
  thumbnail: {
    type: Object,
    default: {
      fileId: "",
      url: "",
    },
  },
  link: { type: String },
  organisedBy: { type: String, required: true },
});

module.exports = mongoose.model("MasterClass", masterclassmodel);
