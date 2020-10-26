import { TYPES } from './Types';
import * as logger from './util/Logger';
import { resetTypeToJsonFile } from '../jsontest/JsonLoader';

const updateOptions = {
  new: true,
  upsert: true,
  useFindAndModify: false,
};

let cache = null;

const deleteById = (id, type) =>
  new Promise((resolve, reject) => {
    type.entity
      .deleteOne({ id })
      .then(() => {
        cache[type.id] = cache[type.id].filter((e) => e.id !== id);
        resolve();
      })
      .catch((e) => {
        logger.error(e);
        reject(new Error('Could not delete ' + type + ' from entity cache with id ' + id));
      });
  });

const initialiseType = (type) =>
  new Promise((resolve, reject) => {
    logger.log('Initialising ' + type.id + ' entitiy cache..');
    type.entity
      .find({})
      .then((entities) => {
        cache[type.id] = entities.map((e) => e.toObject());
        logger.log(
          'Initialised entity cache with ' + cache[type.id].length + ' ' + type.id + '(s)'
        );
        resolve();
      })
      .catch((e) => {
        logger.error(e);
        reject(new Error('Could not initialise entity cache for ' + type));
      });
  });

const initialise = () => {
  cache = {};
  return Promise.all(Object.values(TYPES).map((t) => initialiseType(t)));
};

const upsert = (params, type) =>
  new Promise((resolve, reject) => {
    type.entity
      .findOneAndUpdate({ id: params.id }, params, updateOptions)
      .then((update) => {
        const elementIndex = cache[type.id].findIndex((e) => e.id === params.id);
        const newElement = update.toObject();
        if (elementIndex !== -1) {
          cache[type.id][elementIndex] = newElement;
        } else {
          cache[type.id].push(newElement);
        }
        if (type.postFetch != null) {
          cache[type.id] = type.postFetch(cacheExport, cache[type.id]);
        }
        let res = cache[type.id].find((e) => e.id === update.id);
        resolve(type.expand != null ? type.expand(cacheExport, res) : res);
      })
      .catch((e) => {
        logger.error(e);
        reject(new Error('Could not upsert ' + type + ' with params ' + params));
      });
  });

const entities = (type) => cache[type.id];

const refresh = (type, entities) => {
  cache[type.id] = entities;
};

const deleteOne = (id, type) =>
  type.deleteOne == null ? deleteById(id, type) : type.deleteOne(cacheExport, id);

const dbUpdates = () => {
  // intentionally empty. used to insert db resets via json files for testing if needed
  return resetTypeToJsonFile(null, upsert);
};

const postFetchActions = () => {
  Object.values(TYPES).forEach((type) => {
    if (type.postFetch != null) {
      cache[type.id] = type.postFetch(cacheExport, cache[type.id]);
    }
  });
};

const cacheExport = { entities, refresh, deleteOne, upsert };

export const getCache = async () => {
  if (cache == null) {
    try {
      logger.log('Initialising entity cache..');
      await initialise();
      await dbUpdates();
      postFetchActions();
      logger.log('The entity cache has been initialised. ');
    } catch (e) {
      cache = null;
      logger.error(e);
      Promise.reject(new Error('Could not initialise entity cache.'));
    }
  }
  return cacheExport;
};
