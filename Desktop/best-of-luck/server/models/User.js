const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  PhoneNo: {
    type: String, // Changed to String type to accommodate phone number formatting
    required: true,
  },
  DOB: {
    type: Date, // Changed to Date type for better handling of date
    required: true,
  },
  Gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'custom'], // Specify allowed values
  }
});

module.exports = mongoose.model('User', UserSchema);
