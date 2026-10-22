/**
 * Seed Script – creates demo attendees and events in MongoDB.
 *
 * Run: node seed.js
 *
 * Creates:
 *   - attendee@eventhub.com  / password123  (role: attendee)
 *   - organizer@eventhub.com / password123  (role: organizer)
 *   - admin@eventhub.com     / password123  (role: admin)
 *   - 5 sample events
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Attendee = require('./models/Attendee');
const Event = require('./models/Event');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Attendee.deleteMany({});
  await Event.deleteMany({});
  console.log('Cleared existing Attendee and Event documents');

  // Hash password
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Seed attendees
  await Attendee.insertMany([
    { name: 'Arjun Patel', email: 'attendee@eventhub.com', phone: '9876543210', password: hashedPassword, role: 'attendee' },
    { name: 'Priya Shah', email: 'organizer@eventhub.com', phone: '9876543211', password: hashedPassword, role: 'organizer' },
    { name: 'Admin User', email: 'admin@eventhub.com', phone: '9876543212', password: hashedPassword, role: 'admin' },
  ]);
  console.log('Seeded 3 attendees');

  // Seed events
  await Event.insertMany([
    {
      title: 'Tech Summit 2026',
      category: 'Technology',
      date: new Date('2026-11-15'),
      venue: 'CSPIT Auditorium, Charusat',
      ticketsAvailable: 200,
    },
    {
      title: 'Garba Night 2026',
      category: 'Cultural',
      date: new Date('2026-10-25'),
      venue: 'CHARUSAT Main Ground',
      ticketsAvailable: 500,
    },
    {
      title: 'Hackathon - CodeStorm',
      category: 'Hackathon',
      date: new Date('2026-11-01'),
      venue: 'DEPSTAR Innovation Lab',
      ticketsAvailable: 0, // Sold out
    },
    {
      title: 'Alumni Meet 2026',
      category: 'Networking',
      date: new Date('2026-12-05'),
      venue: 'CSPIT Seminar Hall',
      ticketsAvailable: 150,
    },
    {
      title: 'Music Fest - Rhythm & Beats',
      category: 'Music',
      date: new Date('2026-11-20'),
      venue: 'Open Air Theatre, Charusat',
      ticketsAvailable: 1000,
    },
  ]);
  console.log('Seeded 5 events');

  await mongoose.disconnect();
  console.log('\n✅ Seed complete! You can now login with:');
  console.log('   attendee@eventhub.com  / password123');
  console.log('   organizer@eventhub.com / password123');
  console.log('   admin@eventhub.com     / password123');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
