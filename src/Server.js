import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import routes from './Routes';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// env
const mongoPwd = process.env.MONGO_ATLAS_PWD;

// mongo host
const mongoAtlasHost = `mongodb+srv://taskmaster:${mongoPwd}@cluster0-svrfx.mongodb.net/test?retryWrites=true&w=majority`;

// mongoose instance connection url connection
mongoose.Promise = global.Promise;
mongoose.connect(mongoAtlasHost, {
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
app.listen(port);
