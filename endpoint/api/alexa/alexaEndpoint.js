'use strict';

module.exports = app => {

  const Alexa = require('ask-sdk-v1adapter');
  const bodyParser = require('body-parser');
  const alexaVerifier = require('alexa-verifier-middleware');
  const alexaContext = require('aws-lambda-mock-context');

  const _ = app._;
  const Promise = app.promise;

  const debugActive = true;

  function debug (tag, message) {
    if (!debugActive) {
      return;
    }
    if (!message) {
      return;
    }
    if (tag) {
      console.log(tag, message);
    }
    else {
      console.log(message);
    }
  }

  app.post('/alexa',
  (req, res, next) => {

    debug('REQUEST', req);

    next();
  },
  alexaVerifier,
  bodyParser.json(),
  (req, res) => {

    return res.status(500).json({});
  });

};
