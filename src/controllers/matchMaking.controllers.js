const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let { initImageKit } = require("../utils/imagekit.js");
const investorsData = require("../../InvestorsData.json")


const UserSchema = require("../models/user.schema.js");
const { getChatCompletion } = require("../utils/openai.js");
const MemberSchema = require("../models/member.schema.js");


exports.allow_matchmaking = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch matchmaking data by ID
        const member = await MemberSchema.findById(id);
        if (!member) {
            return next(new ErrorHandler("member not found", 404));
        }

        const usefulFields = {
            fullName: member.fullName,
            contact: member.contact,
            email: member.email,
            city: member.city,
            country: member.country,
            linkedinProfile: member.linkedinProfile,
            instagram: member.instagram,
            companyName: member.companyName,
            userType: member.userType,
            sector: member.sector,
            businessType: member.businessType,
            stage: member.stage,
            turnover: member.turnover,
            Website: member.Website,
            requirements: member.requirements,
            lookingForCollaboration: member.lookingForCollaboration,
            needFWCConnection: member.needFWCConnection,
            platform: member.platform,
            needTechSupport: member.needTechSupport,
            helpInBranding: member.helpInBranding,
            goals: member.goals,
            problem: member.problem,
            shortDescription: member.shortDescription,
            expandInternationally: member.expandInternationally,
            investmentSupport: member.investmentSupport,
            investmentAmount: member.investmentAmount,
            investmentPurpose: member.investmentPurpose,
            membershipCategory: member.membershipCategory,
        };

        const allMembers = await MemberSchema.find({ _id: { $ne: id } });

        const prompt = `
You are an expert AI assistant for business matchmaking.

You are given one member with the following details:

${JSON.stringify(usefulFields, null, 2)}

Now, from the list of other available members below, find the best possible matches who:
- Can help grow this business,
- Provide mentorship or guidance,
- Collaborate on technology, automation, branding, or expansion,
- Or are aligned in business sector, type, or goals.

If no suitable matches are found, return an empty JSON array: []

Otherwise, return a clean JSON array of matched members in the exact format below:

[
  {
    "name": "Full Name",
    "contact": "+91xxxxxxxxxx",
    "email": "example@email.com",
    "city": "Ahmedabad",
    "country": "India",
    "companyName": "MetroTech Fab",
    "website": "https://www.metrotechfab.com",
    "howTheyCanHelp": "Can help with automation, distribution in Asia, or branding support."
  }
]

Do NOT include any extra explanation or text — only return the raw JSON array.

Here is the list of all other available members:

${JSON.stringify(allMembers.map((m) => ({
            fullName: m.fullName,
            contact: m.contact,
            email: m.email,
            city: m.city,
            country: m.country,
            companyName: m.companyName,
            Website: m.Website,
            userType: m.userType,
            sector: m.sector,
            businessType: m.businessType,
            stage: m.stage,
            turnover: m.turnover,
            shortDescription: m.shortDescription,
            requirements: m.requirements,
            goals: m.goals,
            problem: m.problem,
            investmentSupport: m.investmentSupport,
            investmentAmount: m.investmentAmount,
            investmentPurpose: m.investmentPurpose,
        }), null, 2))}
`;


        const aiResponse = await getChatCompletion(prompt);

        let matchedConnections;
        try {
            matchedConnections = JSON.parse(aiResponse);
        } catch (parseError) {
            return res.status(500).json({
                success: false,
                message: 'Failed to parse AI response.',
                error: parseError.message
            });
        }

        res.status(200).json({
            success: true,
            message: matchedConnections.length === 0 ? 'No matchmaking found' : 'Matchmaking successful',
            data: matchedConnections
        });


    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


