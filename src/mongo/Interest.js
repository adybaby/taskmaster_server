import Mongoose from 'mongoose';

const interest = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
  },
  userId: {
    type: String,
    required: 'userId is required',
  },
  vacancyId: {
    type: String,
    required: 'vacancyId is required',
  },
  status: {
    type: String,
    required: 'status is required',
  },
  comments: {
    type: String,
    required: 'comments is required',
  },
  startDate: {
    type: Date,
    required: 'startDate is required',
  },
  endDate: {
    type: Date,
    required: 'endDate is required',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export default Mongoose.model('interest', interest);
