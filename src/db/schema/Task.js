import Mongoose from 'mongoose';

const task = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
    required: 'id is a required field for Task',
  },
  title: {
    type: String,
    required: 'title is a required field for Task',
  },
  type: {
    type: String,
    required: 'type is a required field for Task',
  },
  shortDescription: {
    type: String,
  },
  moreInformation: {
    type: String,
  },
  relatedLinks: {
    type: Array,
  },
  tags: {
    type: Array,
  },
  priority: {
    type: String,
  },
  hypotheses: {
    type: String,
  },
  successfulIf: {
    type: String,
  },
  approach: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  cost: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
  },
  modifiedDate: {
    type: Date,
    default: Date.now,
  },
  modifiedBy: {
    type: String,
  },
});

export default Mongoose.model('task', task);
