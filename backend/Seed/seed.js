const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const connectDB = require('../config/db');
const Task = require('../models/Task');
const User = require('../models/User');
const mongoose = require('mongoose');

function validateSeedConfig() {
  const email = process.env.SEED_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_USER_PASSWORD;
  const name = process.env.SEED_USER_NAME?.trim() || 'TaskFlow Demo';

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Set a valid SEED_USER_EMAIL in backend/.env before seeding.');
  }

  if (!password || password.length < 8 || password.length > 128) {
    throw new Error('Set SEED_USER_PASSWORD to a value between 8 and 128 characters.');
  }

  if (Buffer.byteLength(password, 'utf8') > 72) {
    throw new Error('SEED_USER_PASSWORD must be no more than 72 UTF-8 bytes.');
  }

  return { email, password, name };
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(23, 59, 0, 0);
  return date;
}

const sampleTasks = [
  {
    title: 'Plan this week',
    description: 'Choose the three most important outcomes for the week.',
    status: 'completed',
    priority: 'medium',
    dueDate: daysFromNow(-2)
  },
  {
    title: 'Review product feedback',
    description: 'Group customer notes into themes and capture the next actions.',
    status: 'in-progress',
    priority: 'high',
    dueDate: daysFromNow(1)
  },
  {
    title: 'Prepare the project demo',
    description: 'Polish the walkthrough and check the registration flow.',
    status: 'pending',
    priority: 'high',
    dueDate: daysFromNow(3)
  },
  {
    title: 'Organize design references',
    description: 'Collect the visual references for the next dashboard iteration.',
    status: 'pending',
    priority: 'low',
    dueDate: null
  },
  {
    title: 'Send meeting notes',
    description: 'Share decisions and owners from the product sync.',
    status: 'pending',
    priority: 'medium',
    dueDate: daysFromNow(-1)
  },
  {
    title: 'Take a proper lunch break',
    description: 'Step away from the screen and reset before the afternoon.',
    status: 'completed',
    priority: 'low',
    dueDate: daysFromNow(0)
  }
];

async function seed() {
  const { email, password, name } = validateSeedConfig();
  await connectDB();

  let user = await User.findOne({ email });
  let createdUser = false;

  if (!user) {
    user = await User.create({ name, email, password });
    createdUser = true;
  }

  let insertedTasks = 0;
  let updatedTasks = 0;

  for (const sampleTask of sampleTasks) {
    const result = await Task.updateOne(
      { user: user._id, title: sampleTask.title },
      {
        $set: {
          description: sampleTask.description,
          status: sampleTask.status,
          priority: sampleTask.priority,
          dueDate: sampleTask.dueDate
        }
      },
      { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    insertedTasks += result.upsertedCount;
    updatedTasks += result.modifiedCount;
  }

  console.log(`Seed complete. Demo account ${createdUser ? 'created' : 'already existed'}; ${insertedTasks} sample tasks inserted and ${updatedTasks} updated.`);
  console.log(`Demo email: ${email}`);
  if (!createdUser) {
    console.log('The existing account password was not changed; use its current password to sign in.');
  }
}

seed()
  .catch((error) => {
    console.error('TaskFlow database seed failed:', error.name || 'Error');
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
