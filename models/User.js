const mongoose = require('mongoose');

const { Schema } = mongoose;

const registrationSchema = new Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phoneNumber:{
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    accountBalance: {
        type: Number,
        required: true,
    },
    status: {
        type: Boolean,
        required: true,
    },
    emailVerificationCode: String,
    transactionPin: String,
    kycLevel: String,
    bvn: String,
    accountNumber:String,
    emailVerificationCodeExpiryDate:String,
  
})
const User = mongoose.model('User', registrationSchema);
module.exports = { User };
