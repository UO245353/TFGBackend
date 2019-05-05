'use strict';

//////////////
// REQUIRES //
//////////////

const server = require('./server');
const config = require('./config');

let app = require('express')();

///////////////////
// AUX FUNCTIONS //
///////////////////

function saveWorker(data) {
  app.workerNum = data.workerNum;
}

/////////////////
// INIT SERVER //
/////////////////

process.on('message', saveWorker);

app.config = config;

server.init(app);
