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
  bio: {
    type: String,
  },
  skills: {
    type: Array,
  },
  available: {
    type: Array,
  },
  disabledHints: {
    type: Array,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

export default Mongoose.model('user', user);
