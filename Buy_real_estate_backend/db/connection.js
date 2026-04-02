require('dotenv').config();
const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI;

async function connectToDatabase() {
  if (mongoose.connection.readyState === 0) {
    try {
    	// we can make 50 concurrent socket connections to the db.
      await mongoose.connect(uri, { maxPoolSize: 50 });
      console.log('Connected to MongoDB...');
    } catch (error) {
      console.error('Failed to connect to MongoDB -> ', error.message);
      throw error; 
    }
  }
}  

module.exports = { connectToDatabase };