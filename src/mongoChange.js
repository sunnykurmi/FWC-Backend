const mongoose = require('mongoose');
const User = require('./models/user.schema'); // Update with actual path

const updateRolesToArray = async () => {
  try {
    await mongoose.connect('mongodb+srv://firstworldcommunity1:SXrstGP36Dg5oYGJ@cluster0.kajpb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'); // replace with your DB URI

    const users = await User.find({});

    for (const user of users) {
      if (typeof user.role === 'string') {
        let newRoles = [];

        if (user.role === 'admin') {
          newRoles = ['admin', 'member'];
        } else {
          newRoles = [user.role];
        }

        user.role = newRoles;
        await user.save();
      }
    }

    console.log('Roles updated successfully');
    mongoose.disconnect();
  } catch (err) {
    console.error('Error updating roles:', err);
  }
};

updateRolesToArray();
