'use strict';

module.exports = app => {

  const Alexa = require('ask-sdk-core');
  const bodyParser = require('body-parser');
  const alexaVerifier = require('alexa-verifier-middleware');
  const alexaContext = require('aws-lambda-mock-context');

  const alexaLib = require('../../../lib/alexaLib')(app);

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
      console.log(tag,':', message);
    }
    else {
      console.log(message);
    }
  }

  app.post('/alexa',
  alexaVerifier,
  bodyParser.json(),
  (req, res) => {

    debug('REQUEST BODY', 'REQUEST');

    let context = alexaContext();

    context.Promise
    .then(resp => res.status(200).json(resp) )
    .catch(err => {
      console.log(req.body.request);
      console.log(err);
      return res.status(400).json({error: err});
    });

    let event = req.body;

    let skill;

    if (!skill) {
      skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        alexaLib.handlers.LaunchRequestHandler,
        alexaLib.handlers.HelpIntentHandler,
        alexaLib.handlers.CancelAndStopIntentHandler,
        alexaLib.handlers.SessionEndedRequestHandler
      )
      .addErrorHandlers(alexaLib.handlers.ErrorHandler)
      .create();
    }

    return skill.invoke(event, context);

  });

};
