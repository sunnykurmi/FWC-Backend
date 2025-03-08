const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    title: { type: String, required: true },

    date: { type: String, required: true },

    time: { type: String, required: true },

    register_link: { type: String },
    
    location: {
        type: String
    },
    
    thumbnail: {
        type: Object,
        default: {
            fileId: "",
            url: "",
        },
    },

});

module.exports = mongoose.model("exclusive_event", schema);
