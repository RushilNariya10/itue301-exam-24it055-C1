const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Attendee = require('../models/Attendee');

const router = express.Router();

/**
 * Task 3 – POST /api/v1/auth/login
 *
 * Authenticates an attendee and issues a JWT token.
 * Public route – not protected by authGuard.
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find attendee by email
    const attendee = await Attendee.findOne({ email });
    if (!attendee) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, attendee.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Issue JWT
    const token = jwt.sign(
      { id: attendee._id, role: attendee.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      role: attendee.role,
      attendee: {
        _id: attendee._id,
        name: attendee.name,
        email: attendee.email,
        role: attendee.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
