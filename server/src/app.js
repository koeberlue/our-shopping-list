const MONGODB_HOST = process.env.MONGODB_HOST || 'mongodb';
const MONGODB_PORT = process.env.MONGODB_PORT || '27017';
const MONGODB_DB = process.env.MONGODB_DB     || 'osl';

//const MULTIBOARD_MODE = !!parseInt(process.env.MULTIBOARD_MODE);
const MULTIBOARD_MODE = true;

const mongoose = require("mongoose");
const express = require("express");

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.disable('x-powered-by');
app.use(express.static('client/dist'));
app.use(express.json());

mongoose.connect(`mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// https://mongoosejs.com/docs/deprecations.html
mongoose.set('useFindAndModify', false);

const router = express.Router()
if (MULTIBOARD_MODE) {
  app.use('/something', router)
} else {
  app.use(router)
}

module.exports = {
  app,
  http,
  io,
  router
};
