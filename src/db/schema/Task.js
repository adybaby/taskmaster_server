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
  score: {
    type: Number,
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
  editors: {
    type: Array,
    required: 'editors is a required field for Task',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  createdBy: {
    type: String,
    required: 'createdBy is a required field for Task',
  },
  modifiedDate: {
    type: Date,
    default: Date.now,
  },
  modifiedBy: {
    type: String,
    required: 'modifiedBy is a required field for Task',
  },
});

export default Mongoose.model('task', task);
