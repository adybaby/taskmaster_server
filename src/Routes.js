import { query } from './db/Db';

/**
Post a JSON string in the BODY as follows:

Get all task summaries..
action: summaries

Get a task map..
action: map

Get filtered chart data..
action: chart
params: { filterSkills:[id], filterDateRange:{startDate, endDate} }

Get an expanded user record of the given id..
action: user
id

Get an expanded task record of the given id..
action: task
id

Get all entities of a given type..
action: all
type: task|vacancy|skill|interest|contribution|user

Get one entity of a given type with given id...
action: one
type: task|vacancy|skill|interest|contribution|user
id

Upsert an entity of the given type with an id specified in params..
action: upsert
type: task|vacancy|skill|interest|contribution|user
params: {id, ... }

Upsert many entities matching the ids of the provided entities of the provided type
action: upsertMany
type: task|vacancy|skill|interest|contribution|user
params: [{id, ... }]

Delete an entity of the given type with the given id
action: delete
type: task|vacancy|skill|interest|contribution|user
id

Replace all contribution links for a give task id with the provided ones
action: setContributions
params: {id ,newLinks:[id, ...] }
 */

module.exports = function routes(app) {
  app.route('/query').post(query);
};
