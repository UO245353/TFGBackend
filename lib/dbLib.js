'use strict';

function init(app){

  let db = false;

  function dbAdapter(){

    let ret = require('mongoose');

    ret.Promise = dbPromise();

    return ret;
  }

  function dbInstance(){

    db = dbAdapter();

    return db;
  }

  function dbPromise(){

    return app.promise;
  }

  function dbConnect(){

    if(!db){
      dbInstance();
    }

    return db.set('useNewUrlParser', true).set('useFindAndModify', false).set('useCreateIndex', true).connect(app.config.server.dbUrl);
  }

  function dbDisconnect(){

    if(!!db){

      db.disconnect();
    }
  }

  function createConnection(){

    return dbAdapter().set('useNewUrlParser', true).set('useFindAndModify', false).set('useCreateIndex', true).createConnection(app.config.server.dbUrl);
  }

  return {
    dbAdapter,
    dbPromise,
    dbInstance,
    dbConnect,
    dbDisconnect,
    createConnection,
    MONGO_ID_LEN: 24
  };
}

module.exports = {
  init
};
