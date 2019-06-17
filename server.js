'use strict';

//////////////
// REQUIRES //
//////////////

const BBPromise = require('bluebird');
const express = require('express');
const http = require('http');
const cors = require('cors');
const _ = require('lodash');

const customMiddleware = require('./middleware/customMiddleware');
const errorLib = require('./lib/errorLib');
const successLib = require('./lib/successLib');
const authLib = require('./lib/authLib');
const adminLib = require('./lib/adminLib');
const cryptoLib = require('./lib/cryptoLib');
const tokenLib = require('./lib/tokenLib');
const dbLib = require('./lib/dbLib');

module.exports.init = app => {

  function startHttpServer() {
    return new BBPromise((resolve, reject) => {

      app.disable('x-powered-by');
      app.use(customMiddleware.setNoCacheHeaders());
      app.use(cors({credentials: true, origin: true}));

      require('./endpoint/api/admin/adminEndpoint')(app);

      console.log('Admin Endpoint Required');

      require('./endpoint/api/admin/loginEndpoint')(app);

      console.log('Login Endpoint Required');

      require('./endpoint/api/admin/themeEndpoint')(app);

      console.log('Theme Endpoint Required');

      require('./endpoint/api/alexa/alexaEndpoint')(app);

      console.log('Theme Endpoint Required');

      app.get('/api/*', (req, res) => res.status(404).json('Unexistent url path') );
      app.post('/api/*', (req, res) => res.status(404).json('Unexistent url path') );

      app.use(errorLib.errorHandler);

      app.httpServer = http.createServer(app);

      app.httpServer.listen(app.config.server.appPort, (err) => {

        if (!!err) {

          return reject(err);
        }

        console.log('HTTP listening. Port: ' + app.config.server.appPort);
        resolve();
      });
    });
  }

  app.dbLib = dbLib.init(app);
  app.promise = BBPromise;
  app._ = _;
  app.errorLib = errorLib;
  app.successLib = successLib;

  return app.dbLib.dbConnect()
  .then(() => startHttpServer())
  .then(() => app);
};
