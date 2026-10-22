const express = require('express');
const Event = require('../models/Event');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

/**
 * Task 3 – GET /api/v1/events
 *
 * Returns all events. Public route (no authGuard required).
 * HTTP 200 on success.
 */
router.get('/', async (req, res, next) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({ success: true, events });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/events  (organizer/admin only – protected)
 *
 * Creates a new event.
 */
router.post('/', authGuard, async (req, res, next) => {
  try {
    const { title, category, date, venue, ticketsAvailable } = req.body;

    if (!title || !date || !venue) {
      return res.status(400).json({
        success: false,
        message: 'title, date and venue are required.',
      });
    }

    const event = await Event.create({ title, category, date, venue, ticketsAvailable });
    res.status(201).json({ success: true, event });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/events/:id  (public)
 */
router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.status(200).json({ success: true, event });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
