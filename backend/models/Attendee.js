const mongoose = require('mongoose');

/**
 * Task 5 – Attendee Schema
 * Fields: name (required), email (required, unique), phone, password, role
 */
const attendeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Attendee name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['attendee', 'organizer', 'admin'],
      default: 'attendee',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendee', attendeeSchema);
