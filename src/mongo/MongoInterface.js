import Interest from './Interest';
import Skill from './Skill';
import Task from './Task';
import User from './User';
import Vacancy from './Vacancy';
import ContributionLink from './ContributionLink';
import { v4 as uuid } from 'uuid';

const ENTITIES = {
  contribution: ContributionLink,
  interest: Interest,
  skill: Skill,
  task: Task,
  user: User,
  vacancy: Vacancy,
};

export const query = (req, res) => {
  const entity = ENTITIES[req.body.entity];
  const udpateOrQuery = req.body.updateOrQuery;
  const action = req.body.action;

  if (typeof entity === 'undefined' || entity === null) {
    return res.status(500).json('The entity parameter in the request cannot be null.');
  }

  if (typeof udpateOrQuery === 'undefined' || udpateOrQuery === null) {
    return res.status(500).json('The udpateOrQuery parameter in the request cannot be null.');
  }

  if (typeof action === 'undefined' || action === null) {
    return res.status(500).json('The action parameter in the request cannot be null.');
  }

  const updateOptions = {
    new: true,
    upsert: true,
    useFindAndModify: false,
  };

  const callback = (err, result) => {
    if (err) return res.status(500).json(err);
    return res.json(result);
  };

  switch (action) {
    case 'find':
      entity.find(udpateOrQuery, callback);
      break;
    case 'update':
      entity.findOneAndUpdate({ id: udpateOrQuery.id }, udpateOrQuery, updateOptions, callback);
      break;
    case 'delete':
      entity.deleteOne({ id: udpateOrQuery.id }, udpateOrQuery, updateOptions, callback);
      break;
    default:
      return res.status(500).send('No operations matched the action: ' + req.body.action);
  }
};
