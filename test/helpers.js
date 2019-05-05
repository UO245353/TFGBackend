'use strict';

const BPromise = require('bluebird');
const admin = require('../model/adminModel');
const theme = require('../model/themeModel');

function stopServerInstance(serverInstance, name) {
  return new BPromise((resolve, reject) => {
    serverInstance.close((err) => {
      console.log(name,' has been closed');
      return err ? reject(err) : resolve();
    });
  });
}

function stopServers(app) {
  console.log('STOPPING SERVERS...');
  return BPromise.all([
    stopServerInstance(app.httpServer, 'Admin'),
  ])
  .then(() => {
    console.log('STOPPED ALL SERVERS...');
  });
}

function cleanDatabase(app) {

  return BPromise.all([
    admin(app).deleteMany({}).exec(),
    theme(app).deleteMany({}).exec()
  ]);
}

function disconnectDb(app) {
  return app.dbLib.dbDisconnect();
}

module.exports = {
  stopServers: stopServers,
  cleanDatabase: cleanDatabase,
  disconnectDb: disconnectDb
};
