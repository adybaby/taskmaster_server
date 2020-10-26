import { ACTIONS } from './Actions';
import { TYPES } from './Types';
import { getCache } from './EntityCache';
import { getMap } from './MapActions';
import { expandUser } from './UserActions';
import { expandTask, summariseTask } from './TaskActions';
import { populateChartCache, getChartData } from './ChartCache';
import * as logger from './util/Logger';

let cache = null;

const checkCache = async () => {
  if (cache == null) {
    cache = await getCache();
    logger.debug('Initialising Chart Cache..');
    populateChartCache(cache);
    logger.debug('Initialised Chart Cache');
  }
};

checkCache();

const availableTypes = Object.values(TYPES)
  .map((t) => t.id)
  .join(', ');

export const query = (req, res) => {
  checkCache()
    .then(() => {
      try {
        const action = req.body.action == null ? null : req.body.action;
        const params = req.body.params == null ? null : req.body.params;
        const foundType = Object.values(TYPES).find((t) => t.id === req.body.type);
        const type = foundType == null ? null : foundType;
        const id = req.body.id == null ? null : req.body.id;

        logger.debug('Received request with body : ', req.body);

        const haveParams = (fields) => {
          const msgs = [];

          if (typeof fields.id !== 'undefined' && fields.id === null) {
            msgs.push("'id'");
          }

          if (
            typeof fields.params !== 'undefined' &&
            (fields.params === null || (!Array.isArray(fields.params) && fields.params.id === null))
          ) {
            msgs.push("'params.id'");
          }

          if (
            typeof fields.type !== 'undefined' &&
            (fields.type === null || !availableTypes.includes(req.body.type))
          ) {
            msgs.push("a valid 'type' (" + availableTypes + ' - provided: ' + req.body.type + ')');
          }

          if (msgs.length > 0) {
            res
              .status(500)
              .json(msgs.join(' and ') + " must be provided for a '" + action + "' action.");
            return false;
          } else return true;
        };

        const errorResponse = (e) => {
          res
            .status(500)
            .json(
              "Could not perform action '" +
                action +
                (type != null ? "' for type '" + type.id + "'" : "'") +
                (id != null ? ' with id ' + id : '') +
                " due to an internal server error.  This has been logged on the server. The nested error is '" +
                e.message +
                "'"
            );
        };

        const actionErrorResponse = () =>
          res
            .status(500)
            .json(
              "Invalid action. 'action' must be one of " +
                Object.values(ACTIONS).join(', ') +
                '.  Provided: ' +
                action
            );

        switch (action) {
          case ACTIONS.GET_TASK_SUMMARIES:
            try {
              logger.debug('Retrieving task summaries..');
              const response = cache.entities(TYPES.TASK).map((t) => summariseTask(cache, t));
              logger.debug('Responding with ' + response.length + ' task summaries.');
              res.json(response);
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }

            break;
          case ACTIONS.GET_TAGS:
            try {
              logger.debug('Retrieving tags..');
              const tags = new Set();
              cache.entities(TYPES.TASK).forEach((task) => {
                task.tags.forEach((tag) => {
                  tags.add(tag);
                });
              });
              const response = [...tags].sort();
              logger.debug('Responding with ' + response.length + ' tags.');
              res.json(response);
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }

            break;
          case ACTIONS.GET_MAP:
            try {
              logger.debug('Restrieving tasks map..');
              const response = getMap(cache);
              logger.debug('Responding with ' + response.length + ' tasks in map.');
              res.json(response);
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }
            break;
          case ACTIONS.GET_CHART:
            try {
              logger.debug('Restrieving chart..');
              const response = getChartData(params.filterDateRange);
              logger.debug('Responding with chart.', response);
              res.json(response);
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }
            break;
          case ACTIONS.GET_ALL:
            try {
              if (haveParams({ type })) {
                logger.debug("Retrieved all entries of type '" + type.id + "'..");
                const response = cache.entities(type);
                logger.debug(
                  'Responding to get all(' +
                    type.id +
                    ') request with ' +
                    response.length +
                    ' entries.'
                );
                res.json(response);
              }
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }
            break;
          case ACTIONS.GET_ONE:
            try {
              if (haveParams({ id, type })) {
                logger.debug(
                  "Retrieving one entry of type '" + type.id + "' with id '" + id + "'.."
                );
                const response = cache.entities(type).find((e) => e.id === id);
                logger.debug(
                  "Responding with one entry of type '" + type.id + "' with id '" + id + "': ",
                  response
                );
                res.json(response == null ? null : response);
              }
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }
            break;
          case ACTIONS.GET_USER:
            try {
              if (haveParams({ id })) {
                logger.debug('Retrieving full user information for user with id ' + id + '..');
                let response = null;
                const user = cache.entities(TYPES.USER).find((u) => u.id === id);
                if (user != null) {
                  response = expandUser(cache, user);
                }
                logger.debug(
                  'Responding with full user information for user with id ' + id + ': ',
                  response
                );
                res.json(response);
              }
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }
            break;
          case ACTIONS.GET_TASK:
            try {
              if (haveParams({ id })) {
                logger.debug('Retrieving full task information for user with id ' + id + '..');
                let response = null;
                const task = cache.entities(TYPES.TASK).find((t) => t.id === id);
                if (task != null) {
                  response = expandTask(cache, task);
                }
                logger.debug(
                  'Responding with full task information for task with id ' + id + ': ',
                  response
                );
                res.json(response);
              }
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }
            break;
          case ACTIONS.UPSERT:
            try {
              if (haveParams({ type, params })) {
                logger.debug('Upserting ' + type.id + ' with id ' + params.id + '..');
                cache
                  .upsert(params, type)
                  .then((newElement) => {
                    logger.debug(
                      'Upserted ' + type.id + ' with id ' + params.id + ': ',
                      newElement
                    );
                    res.json(newElement);
                  })
                  .catch((e) => {
                    logger.error(e);
                    errorResponse(e);
                  });
              }
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }
            break;
          case ACTIONS.UPSERT_MANY:
            try {
              if (haveParams({ type, params })) {
                logger.debug('Upserting ' + type.id + ' with ' + params.length + ' new documents');
                Promise.all(params.map((doc) => cache.upsert(doc, type)))
                  .then((newElements) => {
                    logger.debug(
                      'Upserted ' + type.id + ' with ' + newElements.length + ' new documents',
                      newElements
                    );
                    res.json(newElements);
                  })
                  .catch((e) => {
                    logger.error(e);
                    errorResponse(e);
                  });
              }
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }
            break;
          case ACTIONS.SET_CONTRIBUTIONS:
            try {
              if (haveParams({ params })) {
                logger.debug('Setting contributions for task with id ' + params.id);

                Promise.all(
                  cache
                    .entities(TYPES.CONTRIBUTION_LINK)
                    .filter((e) => e.contributorId === params.id || e.contributeeId === params.id)
                    .map((link) => cache.deleteOne(link.id, TYPES.CONTRIBUTION_LINK))
                )
                  .then(() => {
                    Promise.all(
                      params.newLinks.map((doc) => cache.upsert(doc, TYPES.CONTRIBUTION_LINK))
                    )
                      .then((newElements) => {
                        logger.debug(
                          'Upserted contribution links with ' +
                            newElements.length +
                            ' new documents',
                          newElements
                        );
                        res.json(newElements);
                      })
                      .catch((e) => {
                        logger.error(e);
                        errorResponse(e);
                      });
                  })
                  .catch((e) => {
                    logger.error(e);
                    errorResponse(e);
                  });
              }
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }
            break;
          case ACTIONS.DELETE:
            try {
              if (haveParams({ id, type })) {
                logger.debug('Deleting ' + type.id + ' with id ' + id + '..');
                cache
                  .deleteOne(id, type)
                  .then(() => {
                    logger.debug('Deleted ' + type.id + ' with id ' + id + '.');
                    res.json('DELETED ' + id);
                  })
                  .catch((e) => {
                    logger.error(e);
                    errorResponse(e);
                  });
              }
            } catch (e) {
              logger.error(e);
              errorResponse(e);
            }
            break;
          default:
            actionErrorResponse();
            break;
        }
      } catch (e) {
        logger.error(e);
        res.status(500).json('The server encountered an unknown error: ' + e.message);
      }
    })
    .catch((e) => {
      logger.error(e);
      res.status(500).json('The server encountered an unknown error: ' + e.message);
    });
};
