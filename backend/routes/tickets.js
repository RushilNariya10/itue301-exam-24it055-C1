const express = require('express');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const authGuard = require('../middleware/authGuard');

const router = express.Router();

// All ticket routes are protected
router.use(authGuard);

/**
 * Task 3 & 5 – POST /api/v1/tickets
 *
 * Books tickets for an event.
 * - Validates quantity > 0
 * - Validates ticketsAvailable >= quantity (return 400 if not) [Task 5]
 * - Creates Ticket document
 * - Decrements event's ticketsAvailable using findByIdAndUpdate [Task 5]
 * HTTP 201 on success, 400 on validation failure.
 */
router.post('/', async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;

    if (!eventId || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'eventId and quantity are required.',
      });
    }

    const qty = Number(quantity);
    if (qty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.',
      });
    }

    // Task 5 hint: check availability with findById before Ticket.create()
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.',
      });
    }

    // Task 5: Validate availability – never let count go negative (Task 3 hint)
    if (event.ticketsAvailable < qty) {
      return res.status(400).json({
        success: false,
        message: `Only ${event.ticketsAvailable} ticket(s) remaining for "${event.title}". Cannot book ${qty}.`,
      });
    }

    // Create the ticket
    const ticket = await Ticket.create({
      attendeeId: req.attendee.id,
      eventId,
      quantity: qty,
    });

    // Task 5: Decrement ticketsAvailable using findByIdAndUpdate
    await Event.findByIdAndUpdate(eventId, {
      $inc: { ticketsAvailable: -qty },
    });

    res.status(201).json({
      success: true,
      message: 'Ticket booked successfully.',
      ticket,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * Task 3 & 5 – GET /api/v1/tickets/my
 *
 * Returns the authenticated attendee's tickets.
 * Task 5: Uses .populate('attendeeId', 'name email') and .populate('eventId', 'title date venue')
 */
router.get('/my', async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ attendeeId: req.attendee.id })
      .populate('attendeeId', 'name email')    // Task 5 – populate attendee
      .populate('eventId', 'title date venue') // Task 5 – populate event
      .sort({ bookingDate: -1 });

    res.status(200).json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/tickets/all  (admin only)
 *
 * Returns ALL tickets across every attendee.
 * Used by the Admin Panel to show who booked what.
 */
router.get('/all', async (req, res, next) => {
  try {
    if (req.attendee.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access only.' });
    }
    const tickets = await Ticket.find()
      .populate('attendeeId', 'name email phone')
      .populate('eventId', 'title date venue category')
      .sort({ bookingDate: -1 });
    res.status(200).json({ success: true, tickets });
  } catch (err) {
    next(err);
  }
});

/**
 * Task 3 – PATCH /api/v1/tickets/:id/status
 *
 * Updates a ticket's status (booked → cancelled | used).
 * Protected route.
 */
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['booked', 'cancelled', 'used'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `status must be one of: ${validStatuses.join(', ')}.`,
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found.' });
    }

    // Only the owner (or an admin) can update their ticket
    if (ticket.attendeeId.toString() !== req.attendee.id && req.attendee.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'You are not authorised to update this ticket.',
      });
    }

    ticket.status = status;
    await ticket.save();

    res.status(200).json({ success: true, message: 'Ticket status updated.', ticket });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
