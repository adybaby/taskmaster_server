import Mongoose from 'mongoose';

const contributionLink = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
    required: 'id is a required field for ContributionLink',
  },
  contributorId: {
    type: String,
    required: 'contributorId is a required field for ContributionLink',
  },
  contributeeId: {
    type: String,
    required: 'contributeeId is a required field for ContributionLink',
  },
  contribution: {
    type: String,
    required: 'contribution is a required field for ContributionLink',
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

export default Mongoose.model('contributionLink', contributionLink);
