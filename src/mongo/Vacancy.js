import Mongoose from 'mongoose';

const vacancy = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
  },
  taskId: {
    type: String,
    required: 'id is required',
  },
  recruiterId: {
    type: String,
    required: 'id is required',
  },
  priority: {
    type: String,
    required: 'id is required',
  },
  skillId: {
    type: String,
    required: 'id is required',
  },
  role: {
    type: String,
    required: 'id is required',
  },
  status: {
    type: String,
    required: 'id is required',
  },
  startDate: {
    type: Date,
    required: 'id is required',
  },
  endDate: {
    type: Date,
    required: 'id is required',
  },
  comments: {
    type: String,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export default Mongoose.model('vacancy', vacancy);
