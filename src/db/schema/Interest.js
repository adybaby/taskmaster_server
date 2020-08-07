import Mongoose from 'mongoose';

const interest = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
    required: 'id is a required field for Interest',
  },
  userId: {
    type: String,
    required: 'userId is a required field for Interest',
  },
  vacancyId: {
    type: String,
    required: 'vacancyId is a required field for Interest',
  },
  status: {
    type: String,
    required: 'status is a required field for Interest',
  },
  comments: {
    type: String,
  },
  startDate: {
    type: Date,
    required: 'startDate is a required field for Interest',
  },
  endDate: {
    type: Date,
    required: 'endDate is a required field for Interest',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: 'createdBy is a required field for ContributionLink',
  },
  modifiedDate: {
    type: Date,
    default: Date.now,
  },
  modifiedBy: {
    type: String,
    required: 'modifiedBy is a required field for ContributionLink',
  },
});

export default Mongoose.model('interest', interest);
