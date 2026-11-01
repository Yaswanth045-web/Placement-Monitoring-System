const mongoose = require('mongoose');
const app = require('./PMS/backend/server');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://yash045a_db_user:9908877996aA@crt.jittqtl.mongodb.net/placementpulse?retryWrites=true&w=majority';

let isConnected = false;

async function connectToDatabase() {
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return;
  }
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    if (app.seedDefaultAccounts) {
      await app.seedDefaultAccounts();
    }
  } catch (err) {
    console.warn('Vercel serverless MongoDB connection notice:', err.message);
  }
}

module.exports = async (req, res) => {
  await connectToDatabase();
  return app(req, res);
};
