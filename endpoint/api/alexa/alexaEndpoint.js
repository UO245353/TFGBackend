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

    let context = alexaContext();

    context.Promise
    .then(resp => res.status(200).json(resp) )
    .catch(err => {
      console.log(req.body.request);
      console.log(err);
      return res.status(400).json((_.isObject(err)) ? {error: err} : {error: 'unknow'});
    });

    let event = req.body;

    return Promise.resolve()
    .then(() => Alexa
    .SkillBuilders
    .custom()
    .addRequestHandlers(
      alexaLib.handlers.LaunchRequestHandler,
      alexaLib.handlers.HelpIntentHandler,
      alexaLib.handlers.CancelAndStopIntentHandler,
      alexaLib.handlers.SessionEndedRequestHandler,
      alexaLib.handlers.LeeTema,
      alexaLib.handlers.HazTest,
      alexaLib.handlers.CorregirTest,
      alexaLib.handlers.RespondePregunta,
      alexaLib.handlers.AyudaLeeTema,
      alexaLib.handlers.AyudaHazTest,
      alexaLib.handlers.AyudaCorregirTest,
      alexaLib.handlers.AyudaRespondePregunta
    )
    .addErrorHandlers(alexaLib.handlers.ErrorHandler)
    .withSkillId(app.config.amazomAppID)
    .create() )
    .then( skill => skill.invoke(event, context))
    .then(resp => {
      console.log(resp);
      return context.succeed(resp);
    });
  });

};
