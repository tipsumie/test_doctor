const mongoose = require('mongoose');
// Connect to DB
mongoose.connect(process.env.MONGODB_URL);

const connection = mongoose.connection;

connection.on('connected', () => {
  console.log('MongoDB is connected');
});

connection.on('error', (error) => {
  console.log('MongoDB is connected', error);
});

module.exports = mongoose;
