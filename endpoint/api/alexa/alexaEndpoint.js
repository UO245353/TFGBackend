'use strict';

module.exports = app => {

  const Alexa = require('ask-sdk');
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
      console.log(tag, message);
    }
    else {
      console.log(message);
    }
  }

  const handlerDriver = {
    //Generic handlers
    'LaunchRequest': function () {

      return alexaLib.launch(this);
    },
    'AMAZON.HelpIntent': function () {

      return alexaLib.help(this);
    },
    'AMAZON.CancelIntent': function () {

      return alexaLib.cancel(this);
    },
    'AMAZON.StopIntent': function () {

      return alexaLib.cancel(this);
    },
    'Unhandled': function () {

      return this.emit(
        ':ask',
        alexaLib.alexaResponses.NOT_SUPPORTED
      );
    },
    'Speak': function (text) {

      return this.emit(':tell', text);
    }
  };

  app.post('/alexa',
  alexaVerifier,
  bodyParser.json(),
  (req, res) => {

    debug('REQUEST BODY', req.body);

    let context = alexaContext();

    context.Promise
    .then(resp => res.status(200).json(resp) )
    .catch(err => {
      console.log(req.body.request);
      console.log(err);
      return res.status(400).json({error: err});
    });

    let event = req.body;
    let alexaHandler = Alexa.handler(event, context);

    alexaHandler.registerHandlers(handlerDriver);

    return alexaHandler.execute();
  });

};
