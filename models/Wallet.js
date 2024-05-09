const mongoose = require('mongoose');

const { Schema } = mongoose;

const WalletSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    accountNumber: { type: Number },
    balance: { type: Number, default: 2000 },
   
  });
  
  const Wallet = mongoose.model('Wallet', WalletSchema);
  module.exports = { Wallet };