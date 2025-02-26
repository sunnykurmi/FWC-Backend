const mongoose = require('mongoose');
const Member = require('./member.schema.js');

const PaymentSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    paymentId: {
        type: String,
        unique: true,
        sparse: true // Allow null values initially
    },
    signature: {
        type: String
    },
    useremail: {
        type: String,
        required: true
    },
    form: {
        ref: 'member',
        type: mongoose.Schema.Types.ObjectId,
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['created', 'paid', 'failed'],
        default: 'created'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expireAt: {
        type: Date,
        default: function () {
            return this.status === 'created' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : undefined;
        }
    }
}, { timestamps: true });

// Create TTL index on expireAt field
PaymentSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

// Middleware to delete the linked member form when a payment is deleted
PaymentSchema.pre('remove', async function(next) {
    try {
        await Member.findByIdAndDelete(this.form);
        next();
    } catch (error) {
        next(error);
    }
});

const Payment = mongoose.model('members-payment', PaymentSchema);

module.exports = Payment;