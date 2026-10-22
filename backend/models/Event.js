const mongoose = require('mongoose');

/**
 * Task 5 – Event Schema
 * Fields: title (required), category, date (required), venue (required),
 *         ticketsAvailable (min: 0)
 */
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    ticketsAvailable: {
      type: Number,
      required: true,
      min: [0, 'Tickets available cannot be negative'],
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
