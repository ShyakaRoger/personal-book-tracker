const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,  // Added this line
  status: {
    type: String,
    enum: ['to-read', 'reading', 'completed'],
    default: 'to-read'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);