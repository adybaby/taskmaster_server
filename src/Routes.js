import { query } from './mongo/MongoInterface';

module.exports = function routes(app) {
  app.route('/query').post(query);
};
