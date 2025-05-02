const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let { initImageKit } = require("../utils/imagekit.js");
const investorsData = require("../../InvestorsData.json")


const UserSchema = require("../models/user.schema.js");
const MatchMakingSchema = require("../models/MatchMaking.schema.js");
const { getChatCompletion } = require("../utils/openai.js");



exports.create_match_making = catchAsyncErrors(async (req, res, next) => {
    try {
        const {
            fullName,
            phoneNumber,
            email,
            whatsAppNumber,
            location,
            linkedinProfile,
            professionalBackground,
            companyName,
            companyWebsite,
            industrySectors,
            businessType,
            businessDescription,
            problemSolving,
            targetMarket,
            revenueModel,
            businessStage,
            fundingRequirement,
            futureVision,
            currentChallenges,
            keyAchievements,
            teamMembers,
            lookingFor,
            investmentType,
            expertiseRequired,
            contactMethod,
            otherInfo
        } = req.body;

        const requiredFields = [
            'fullName', 'phoneNumber', 'email', 'location', 'companyName', 'companyWebsite',
            'industrySectors', 'businessType', 'businessDescription', 'problemSolving', 'targetMarket',
            'revenueModel', 'businessStage', 'fundingRequirement', 'futureVision', 'currentChallenges',
            'keyAchievements', 'teamMembers', 'lookingFor', 'investmentType', 'contactMethod'
        ];

        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `The following fields are required: ${missingFields.join(', ')}` });
        }


        const newMatchMaking = await MatchMakingSchema.create({

            fullName,
            phoneNumber,
            email,
            whatsAppNumber,
            location,
            linkedinProfile,
            professionalBackground,
            companyName,
            companyWebsite,
            industrySectors,
            businessType,
            businessDescription,
            problemSolving,
            targetMarket,
            revenueModel,
            businessStage,
            fundingRequirement,
            futureVision,
            currentChallenges,
            keyAchievements,
            teamMembers,
            lookingFor,
            investmentType,
            expertiseRequired,
            contactMethod,
            otherInfo
        });

        res.status(201).json({
            success: true,
            data: newMatchMaking
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

exports.all_matchmaking = catchAsyncErrors(async (req, res, next) => {
    try {
        const matchmakings = await MatchMakingSchema.find({});
        res.status(200).json({
            success: true,
            data: matchmakings
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})


exports.allow_matchmaking = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch matchmaking data by ID
        const matchMaking = await MatchMakingSchema.findById(id);
        if (!matchMaking) {
            return next(new ErrorHandler("Matchmaking not found", 404));
        }

        // Extract matchmaking details
        const {
            industrySectors,
            businessType,
            companyName,
            companyWebsite,
            businessDescription,
            targetMarket,
            fundingRequirement,
            problemSolving
        } = matchMaking;

        // Create the prompt for OpenAI
        const prompt = `
        You are an AI startup-investor matchmaking assistant.

        A startup has the following details:
        - Company Name: ${companyName}
        - Company Website: ${companyWebsite}
        - Business Description: ${businessDescription}
        - Target Market: ${targetMarket}
        - Funding Requirement: ${fundingRequirement}
        - Problem Solving: ${problemSolving}
        - Industry Sectors: ${Array.isArray(industrySectors) ? industrySectors.join(', ') : 'N/A'}
        - Business Type: ${Array.isArray(businessType) ? businessType.join(', ') : 'N/A'}

        Full list of available investors and mentors:

        ${JSON.stringify(investorsData, null, 2)}

        ### TASK:
        Analyze carefully and select the TOP 1 best-matching Investors/Mentors/Instructors based on the startup's requirements.

        ### VERY IMPORTANT:
        Return the final output as CLEAN JSON ARRAY with 5 objects.  
        Each object must have exactly these fields:

        {
            "name": "",
            "phoneNumber": "",
            "email": "",
            "whatsAppNumber": "",
            "location": "",
            "industrySectors": [""],
            "businessType": [""],
            "howYouKnowUs": ""
        }

        DO NOT add any extra text like "Here are the top 5 matches" — ONLY return the pure JSON array, no explanation, no markdown.

        Start directly with [ and end with ].
        `;

        // Get chat completion from OpenAI
        const aiResponse = await getChatCompletion(prompt);

        let investorsResponse;

        try {
            investorsResponse = JSON.parse(aiResponse); // Safe parsing
        } catch (parseError) {
            return res.status(500).json({
                success: false,
                message: 'Failed to parse AI response. Try again.',
                error: parseError.message
            });
        }

        res.status(200).json({
            success: true,
            message: 'Matchmaking allowed successfully',
            data: {
                matchMaking,
                topInvestors: investorsResponse
            }
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});





