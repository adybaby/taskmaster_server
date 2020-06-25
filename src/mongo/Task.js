import Mongoose from 'mongoose';

const task = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
  },
  title: {
    type: String,
    required: 'title is required',
  },
  type: {
    type: String,
    required: 'type is required',
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
    required: 'priority is required',
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
