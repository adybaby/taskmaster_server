import Mongoose from 'mongoose';

const skill = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
    required: 'id is a required field for Skill',
  },
  title: {
    type: String,
    required: 'title is a required field for Skill',
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

export default Mongoose.model('skill', skill);
