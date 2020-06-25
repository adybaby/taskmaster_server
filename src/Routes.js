import { query } from './mongo/MongoInterface';

/**
 * Pass a JSON object with:
 * entity: Either "contribution", "interest", "skill", "user", or "vacancy"
 * action: Either "find", "update", or "delete"
 * upgradeOrQuery:
 *   - for "find" pass a filter object {field: filterParam} or {} to return all entities of the given entity
 *   - for "delete" pass only the id of the item to delete
 *   - for "update" pass the object containing field updates.  if the id of the update already exists, it will be updated, otherwise it will be created.
 */
module.exports = function routes(app) {
  app.route('/query').post(query);
};
