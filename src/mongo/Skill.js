import Mongoose from 'mongoose';

const skill = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
  },
  title: {
    type: String,
    required: 'title is required',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export default Mongoose.model('skill', skill);
