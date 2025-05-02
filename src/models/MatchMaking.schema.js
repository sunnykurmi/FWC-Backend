const mongoose = require('mongoose');
const { Schema } = mongoose;

const schema = new Schema({
    // userId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "user",
    //     required: true
    // },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    whatsAppNumber: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    linkedinProfile: {
        type: String
    },
    professionalBackground: {
        type: String
    }
    , companyName: {
        type: String,
        required: true
    },
    companyWebsite: {
        type: String,
        required: true
    },
    industrySectors: [{
        type: String,
        required: true
    }],
    businessType: [{
        type: String,
        required: true
    }],
    businessDescription: {
        type: String,
        required: true
    },
    problemSolving: {
        type: String,
        required: true
    },
    targetMarket: {
        type: String,
        required: true
    },
    revenueModel: {
        type: String,
        required: true
    },
    businessStage: {
        type: String,
        required: true
    },
    fundingRequirement: {
        type: String,
        required: true
    },
    futureVision: {
        type: String,
        required: true
    },
    currentChallenges: {
        type: String,
        required: true
    },
    keyAchievements: {
        type: String,
        required: true
    },
    teamMembers: {
        type: String,
        required: true
    },
    lookingFor: {
        type: String,
        required: true
    },
    investmentType: {
        type: String,
        required: true
    },
    expertiseRequired: [{
        type: String,
    }],
    contactMethod: {
        type: String,
        required: true
    },
    otherInfo: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('match_making', schema);
