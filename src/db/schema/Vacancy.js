import Mongoose from 'mongoose';

const vacancy = Mongoose.Schema({
  id: {
    type: String,
    index: true,
    unique: true,
    required: 'id is a required field for Vacancy',
  },
  taskId: {
    type: String,
    required: 'taskId is a required field for Vacancy',
  },
  recruiterId: {
    type: String,
    required: 'recruiterId is a required field for Vacancy',
  },
  priority: {
    type: String,
    required: 'priority is a required field for Vacancy',
  },
  skillId: {
    type: String,
    required: 'skillId is a required field for Vacancy',
  },
  role: {
    type: String,
    required: 'role is a required field for Vacancy',
  },
  status: {
    type: String,
    required: 'status is a required field for Vacancy',
  },
  startDate: {
    type: Date,
    required: 'startDate is a required field for Vacancy',
  },
  endDate: {
    type: Date,
    required: 'endDate is a required field for Vacancy',
  },
  comments: {
    type: String,
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

export default Mongoose.model('vacancy', vacancy);
