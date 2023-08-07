const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const PostSchema = new Schema({
  Username: {
    type: String,
    required: true,
    default: 'Anonymous_user', // Set a default value for the Username field
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  likes: {
    type: Number,
    default:0
  },
 
  
  likedBy: [
    
      {
      type: Schema.Types.ObjectId,
      ref: 'User'
   
  }
  ]
});

PostSchema.pre('save', function (next) {
  if (!this.likes) {
    this.likes = Math.floor(Math.random() * 100);
  }
  next();
});

module.exports = mongoose.model('Post', PostSchema);