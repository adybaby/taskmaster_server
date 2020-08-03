import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import routes from './Routes';
import cors from 'cors';
import config from './config.json';

const app = express();

// mongo host
const { prefix, domain, params } = config.mongo;
const password = process.env.MONGO_ATLAS_PWD;
const mongoHost = `${prefix}:${password}@${domain}/${params}`;

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect(mongoHost, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
mongoose.set('useCreateIndex', true);

// bodyparser
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// routes
routes(app);

// start
app.listen(config.listenPort);
