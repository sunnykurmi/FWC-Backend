const mongoose = require('mongoose');
const UserSchema = require("../models/user.schema.js");

const updateExpertConnectField = async () => {
  try {
    // Connect to the database
    await mongoose.connect('mongodb+srv://firstworldcommunity1:SXrstGP36Dg5oYGJ@cluster0.kajpb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'); 

    // Add the expert_connect field with the default value 'notapplied' for all users
    const result = await UserSchema.updateMany(
      {},
      {
        $set: { expert_connect: "notapplied" },
      }
    );

    console.log(`${result.modifiedCount} users updated successfully with expert_connect field`);
    
    // Disconnect from the database
    mongoose.disconnect();
  } catch (err) {
    console.error('Error updating expert_connect field:', err);
  }
};

updateExpertConnectField();
