const { catchAsyncErrors } = require("../middlewares/catchAsyncErrors.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const { sendtoken } = require("../utils/sendtoken.js");
const mongoose = require("mongoose");
let path = require("path");
let { initImageKit } = require("../utils/imagekit.js");
const nodemailer = require("nodemailer");
const investorsData = require("../../InvestorsData.json")


const UserSchema = require("../models/user.schema.js");
const { getChatCompletion } = require("../utils/openai.js");
const MemberSchema = require("../models/member.schema.js");
const ExpertConnectSchema = require("../models/expertConnect.schema.js");

exports.getAllMatchmakings = catchAsyncErrors(async (req, res, next) => {
    try {
 const allMatchmakings = await ExpertConnectSchema.find()
      .populate({
        path: "memberId",
        populate: {
          path: "userId", 
        },
      });
              if (!allMatchmakings) {
            return next(new ErrorHandler("No matchmaking found", 404));
        }
        res.status(200).json({
            success: true,
            message: "Matchmaking fetched successfully",
            data: allMatchmakings,
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
})

exports.create_matchmaking = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;
      
        const user = await UserSchema.findById(id);
        user.expert_connect = "pending";
        await user.save();
        
        const member = await MemberSchema.findOne({ userId: id });
        if (!member) {
            return next(new ErrorHandler("member not found", 404));
        }
        const newConnection = await ExpertConnectSchema.create({
            memberId: member._id,
        });

        res.status(200).json({
            success: true,
            message: "Matchmaking request created successfully",
            data: newConnection,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
);






exports.allow_matchmaking = catchAsyncErrors(async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch matchmaking data by ID
        const member = await MemberSchema.findOne({ _id: id });
        const userId = member.userId;
        const user = await UserSchema.findById(userId);
        if (!user) {
            return next(new ErrorHandler("User not found", 404));
        }
        user.expert_connect = "completed";
        await user.save();
        if (!member) {
            return next(new ErrorHandler("member not found", 404));
        }
        const allMembers = await MemberSchema.find({ _id: { $ne: id } });

        const prompt = `
You are an expert AI assistant for business matchmaking.

You are given one member with the following details:

${JSON.stringify(member, null, 2)}

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
            const cleanedResponse = aiResponse.trim().replace(/^```(?:json)?\n/, '').replace(/```$/, '');
            matchedConnections = JSON.parse(cleanedResponse);
        } catch (parseError) {
            return res.status(500).json({
                success: false,
                message: 'Failed to parse AI response.',
                error: parseError.message
            });
        }

        const transport = nodemailer.createTransport({
            service: "gmail",
            host: "smtp.gmail.com",
            post: 465,
            auth: {
                user: process.env.MAIL_EMAIL_ADDRESS,
                pass: process.env.MAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: "First World Community",
            to: member.email,
            subject: "Your Matchmaking are succefully generated",
            html: `
<div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
  <h2 style="color: #2c3e50;">🤝 Your Business Matchmaking Results</h2>
  <p>
    Dear <b>${member.fullName}</b>,
    <br /><br />
    We’re excited to share your personalized business matches as part of your FWC Membership journey.
    <br />Below are your top recommended connections based on your profile:
  </p>

  ${matchedConnections.length === 0
                    ? `<p style="color: red;"><b>No matches found</b>. Our team will keep monitoring for suitable opportunities.</p>`
                    : `
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f0f0f0;">
          <th style="border: 1px solid #ccc; padding: 8px;">Name</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Contact</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Email</th>
          <th style="border: 1px solid #ccc; padding: 8px;">City</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Company</th>
          <th style="border: 1px solid #ccc; padding: 8px;">Website</th>
          <th style="border: 1px solid #ccc; padding: 8px;">How They Can Help</th>
        </tr>
      </thead>
      <tbody>
        ${matchedConnections.map(match => `
          <tr>
            <td style="border: 1px solid #ccc; padding: 8px;">${match.name}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${match.contact}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${match.email}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${match.city}, ${match.country}</td>
            <td style="border: 1px solid #ccc; padding: 8px;">${match.companyName}</td>
            <td style="border: 1px solid #ccc; padding: 8px;"><a href="${match.website}" target="_blank">${match.website}</a></td>
            <td style="border: 1px solid #ccc; padding: 8px;">${match.howTheyCanHelp}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `}

  <br /><br />
  <p>
    Thank you for being a valuable member of the <b>First World Community</b>. We hope these connections help you achieve greater success in your journey.
    <br /><br />
    Best regards,<br/>
    <b>FWC Membership Team</b><br/>
    📩 <a href="mailto:info@fwc-india.org">info@fwc-india.org</a><br/>
    🌐 <a href="https://firstworldcommunity.org">firstworldcommunity.org</a>
  </p>
</div>
`

        };

        transport.sendMail(mailOptions, (err, info) => {
            if (err) return next(new ErrorHandler(err, 500));
            res
                .status(200)
                .json({ message: "matchmaking successful", status: matchmaking.status });
        });

        res.status(200).json({
            success: true,
            message: matchedConnections.length === 0 ? 'No matchmaking found' : 'Matchmaking successful',
            data: matchedConnections
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


