const mongoose = require("mongoose");

const schema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",  
        required: true
    },
    name: { type: String, required: true },
    education: { type: String, required: true },
    city: { type: String, required: true },
    socialMedia: { type: String, required: false },
    whatsappNumber: { type: String, required: true },
    description: { type: String, required: true },
});

module.exports = mongoose.model("yuva_shakti", schema);
