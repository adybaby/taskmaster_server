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

/**
 * Pass a JSON object with:
 * entity: Either "contribution", "interest", "skill", "user", or "vacancy"
 * action: Either "find", "update", or "delete"
 * upgradeOrQuery:
 *   - for "find" pass a filter object {field: filterParam} or {} to return all entities of the given entity
 *   - for "delete" pass only the id of the item to delete
 *   - for "update" pass the object containing field updates.  if the id of the update already exists, it will be updated, otherwise it will be created.
 */
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

  const log = (err) => {
    console.log(
      err == null ? 'Failed to perform query' : 'Successfully performed ' + action + ' query'
    );
    console.log('Action');
    console.log(action);
    console.log('Entity');
    console.log(entity);
    console.log('UpdateOrQuery');
    console.log(udpateOrQuery);
    console.log('Errors: ' + err == null ? 'None' : err);
    console.log('\n\n\n');
  };

  const callback = (err, result) => {
    if (err) {
      log(err);
      return res.status(500).json(err);
    }
    if (action !== 'find') {
      log();
    }
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
      entity.deleteOne({ id: udpateOrQuery }, callback);
      break;
    default:
      return res.status(500).send('No operations matched the action: ' + req.body.action);
  }
};
