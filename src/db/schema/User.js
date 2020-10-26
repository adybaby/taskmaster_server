import Mongoose from 'mongoose';

const user = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
    required: 'id is a required field for User',
  },
  firstNames: {
    type: Array,
    required: 'firstNames is a required field for User',
  },
  lastName: {
    type: String,
    required: 'lastName is a required field for User',
  },
  emailAddress: {
    type: String,
    required: 'emailaddress is a required field for User',
  },
  bio: {
    type: String,
  },
  skillIds: {
    type: Array,
  },
  available: {
    type: Array,
  },
  disabledHints: {
    type: Array,
  },
  permissions: {
    type: Array,
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

export default Mongoose.model('user', user);
