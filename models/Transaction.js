const mongoose = require('mongoose');
const { Schema } = mongoose;

 const TransactionSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true },
    recipient: { type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true },
    amount: { type: Number, 
      required: true },
    status: {
      type: String,
      enum: ['Successful', 'Failed'],
      default: 'Success'
    },
    date: {
      type: Date,
      default: Date.now
    }
   
  });

  const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = { Transaction };