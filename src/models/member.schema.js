let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
let jwt = require('jsonwebtoken');
const crypto = require('crypto');


let memberSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",  // Reference to User Schema
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    contact: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        match: /^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)$/,
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
    },
    linkedinProfile: {
        type: String,
        trim: true,
    },
    amount: {
        type: Number,
        required: true,
    },    
}, { timestamps: true });




// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_APT_SECRET
});

// Method to create an order
memberSchema.methods.createOrder = async function() {
    const options = {
        amount: Math.round(this.amount * 100), // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_${this._id}`
    };

    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.log(error);
        throw new Error('Error creating Razorpay order: ' + error.message);
    }
};

// Method to verify payment
memberSchema.statics.verifyPayment = function(paymentDetails) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentDetails;
    const hmac = crypto.createHmac('sha256', razorpay.key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');
    return generatedSignature === razorpay_signature;
};



module.exports = mongoose.model('member', memberSchema);