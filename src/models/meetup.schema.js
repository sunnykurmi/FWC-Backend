const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: { type: String, required: true },

    date: { type: String, required: true },

    time: { type: String, required: true },

    mode: {
        type: String,
        enum: ["online", "offline"],
        default: "online",
     },

    link: { type: String },

    type: {
        type: String,
        enum: ["free", "paid"],
        default: "free",
    },
    organisedBy: { type: String, required: true },

    thumbnail: {
        type: Object,
        default: {
            fileId: "",
            url: "",
        },
    },

});

module.exports = mongoose.model("weekly_meetup", schema);
