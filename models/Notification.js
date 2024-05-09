const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new mongoose.Schema({
    type: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', 
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }

  });

  const Notification = mongoose.model('Notification', notificationSchema)
  module.exports = { Notification 

  }