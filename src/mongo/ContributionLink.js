import Mongoose from 'mongoose';

const contributionLink = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
  },
  contributorId: {
    type: String,
    required: 'contributorId required',
  },
  contributeeId: {
    type: String,
    required: 'contributeeId is required',
  },
  contribution: {
    type: String,
    required: 'contribution field is required',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export default Mongoose.model('contributionLink', contributionLink);
