let mongoose = require('mongoose');

let schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
   website:{
         type: String,
         required: true,
         trim: true,
   },
   description:{
         type: String,
         required: true,
         trim: true,
   },
   socialMedia:{
         type: String,
         required: true,
         trim: true,
   },
   valuation:{
         type: String,
         required: true,
         trim: true,
   },
   incorporate:{
    enum: ['yes', 'no'],
    default:"no"
   },
   incorporationNumber:{
    type: String,
   },
   investmentDetails:{
    type: String,   
   },
   funding:{
    type: String,
   },
   fundingUse:{
    type: String,
   },
   usp:{
    type: String,
   }

}, { timestamps: true });



module.exports = mongoose.model('investor_circle', schema);