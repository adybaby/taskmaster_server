import { TYPES } from './Types';
import * as logger from './util/Logger';

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
        reject(new Error('Could not delete ' + type + ' with id ' + id));
      });
  });

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
        resolve(newElement);
      })
      .catch((e) => {
        logger.error(e);
        reject(new Error('Could not upsert ' + type + ' with params ' + params));
      });
  });

const initialiseType = (type) =>
  new Promise((resolve, reject) => {
    logger.log('Initialising ' + type.id);
    type.entity
      .find({})
      .then((entities) => {
        cache[type.id] = entities.map((e) => e.toObject());
        logger.log('Initialised ' + cache[type.id].length + ' of type ' + type.id);
        resolve();
      })
      .catch((e) => {
        logger.error(e);
        reject(new Error('Could not initialise cache for ' + type));
      });
  });

const initialise = () => {
  cache = {};
  return Promise.all(Object.values(TYPES).map((t) => initialiseType(t)));
};

const entities = (type) => cache[type.id];

const refresh = (type, entities) => {
  cache[type.id] = entities;
};

const deleteOne = (id, type) =>
  type.deleteOne == null
    ? deleteById(type, id)
    : type.deleteOne({ entities, refresh, deleteOne, upsert }, id);

export const getCache = async () => {
  if (cache == null) {
    try {
      logger.log('Initialising cache..');
      await initialise();
      logger.log('The cache has been initialised. ');
    } catch (e) {
      cache = null;
      logger.error(e);
      Promise.reject(new Error('Could not initialise entity cache.'));
    }
  }
  return { entities, refresh, deleteOne, upsert };
};
