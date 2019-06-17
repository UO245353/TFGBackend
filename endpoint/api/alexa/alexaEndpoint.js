'use strict';

module.exports = app => {

  const Alexa = require('ask-sdk');
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

    debug('REQUEST', 'ALEXA REQUEST');

    next();
  },
  alexaVerifier,
  bodyParser.json(),
  (req, res) => {

    debug('REQUEST', Object.keys(req));

    return res.status(500).json({});
  });

};
