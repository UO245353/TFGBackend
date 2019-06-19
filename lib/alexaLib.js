'use strict';

module.exports = app => {

  const Promise = app.promise;
  const alexaController = require('../controller/alexaController');

  function removeCircular(obj){

    return require('circular-ref-fix').createRefs(obj);
  }

  function restoreCircular(obj){

    return require('circular-ref-fix').restoreRefs(obj, true);
  }

  const alexaResponses = {
    WELCOME: 'Bienvenido a Gestión de Tecnologías de la Información',
    HELP: 'Los comandos admitidos son:\nLéeme el tema X.\n Hazme un test del tema X.\n La respuesta es Y.'
    +' \n Corrige el tema X. Siendo X el número del tema e Y una letra de la A a la Z .'
    +' \n\n Si tienes dudas con algunos de los comandos puedes pedir ayuda para cada uno de ellos, por ejemplo.\n Ayúdame con Léeme el tema',
    HELP_LEE_TEMA: 'Ayuda de: Léeme el tema. \n Variantes: dicta el tema, lee el tema, léeme el tema, díctame el tema. Uso: Variante mas número del tema',
    HELP_HAZ_TEST: 'Ayuda de: Hazme un test del tema. \n Variantes: examíname del tema, haz un test del tema, haz un examen del tema, hazme un examen del tema, hazme un test del tema. Uso: Variante mas número del tema',
    HELP_RESPONDE_PREGUNTA: 'Ayuda de: La respuesta es. \n Variantes: respuesta, la respuesta es. Uso: Variante mas una letra de la A a la Z',
    HELP_CORREGIR_TEST: 'Ayuda de: Corrige el tema. \n Variantes: corrígeme el test del tema ,corrige el tema ,corrige el test del tema ,corrígeme el examen del tema ,corrige el examen del tema , . Uso: Variante mas número del tema',
    CANCEL: 'Cancelado',
    EXITING: 'Gestión de Tecnologías de la Información ha sido cerrado',
    NOT_SUPPORTED: 'No soportado'
  };

  const alexaStates = {
    WAITING: 'W',
    DICTATING: 'D',
    TESTING: 'T',
    CORRECTING: 'C'
  };

  const alexaTransitions = {
    DICTATE: {
      name: 'dictate',
      from: alexaStates.WAITING,
      to: alexaStates.DICTATING
    },
    TEST: {
      name: 'test',
      from: alexaStates.WAITING,
      to: alexaStates.TESTING
    },
    CORRECT: {
      name: 'correct',
      from: alexaStates.WAITING,
      to: alexaStates.CORRECTING
    },
    ASNWER: {
      name: 'answer',
      from: alexaStates.CORRECTING,
      to: alexaStates.CORRECTING
    },
    BACK: {
      name: 'back',
      from: [alexaStates.DICTATING, alexaStates.TESTING, alexaStates.CORRECTING],
      to: alexaStates.WAITING
    },
  };

  const stateMachine = require('javascript-state-machine').factory({
    init: alexaStates.WAITING,
    transitions: [
      alexaTransitions.DICTATE,
      alexaTransitions.TEST,
      alexaTransitions.CORRECT,
      alexaTransitions.ASNWER,
      alexaTransitions.BACK,
    ],
    data: function(options) {      //  <-- use a method that can be called for each instance

      return {
        userId: options.userId,
        themeNumber: undefined,
        responseNumber: undefined
      };
    },
    methods: {
      getUserId: function() {

        return this.userId;
      },
      onDictate: function(lifecycle, thNumber){
        console.log('holaaaaaaaaaaaaaaaaaaaaaa');
        this.themeNumber = thNumber;
        // find and return formated theme string
        return Promise.resolve()
        .then(() => alexaController.getThemeContent(this.thNumber))
        .catch(err => {
          console.log(err);
          throw err;
        });
      },
      onTest: function(lifecycle, thNumber){

        this.themeNumber = thNumber;
        // find , save response number and return first theme question
        return true;
      },
      onAnswer: function(lifecycle, response){

        // concat previous result mas find next response and save new response number
        return true;
      },
      onCorrect: function(lifecycle, thNumber){

        this.themeNumber = thNumber;
        // find and return formated theme string

        return true;
      },
      onBack: function(){
        this.themeNumber = undefined;

        return true;
      },
    }
  });

  const handlers = {
    LaunchRequestHandler: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => new stateMachine(handlerInput.requestEnvelope.session.sessionId))
        .then(machine => handlerInput.attributesManager.setSessionAttributes({stateMachine: removeCircular(machine)}) )
        .then(() => handlerInput.responseBuilder
        .speak(alexaResponses.WELCOME)
        .reprompt(alexaResponses.WELCOME)
        .getResponse());
      }
    },
    HelpIntentHandler: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak(alexaResponses.HELP)
        .reprompt(alexaResponses.HELP)
        .getResponse());
      }
    },
    CancelAndStopIntentHandler: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak(alexaResponses.CANCEL)
        .reprompt(alexaResponses.CANCEL)
        .getResponse());
      }
    },
    NavigateHomeIntent: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NavigateHomeIntent';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak(alexaResponses.EXITING)
        .withShouldEndSession(true)
        .getResponse());
      }
    },
    SessionEndedRequestHandler: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
      },
      handle(handlerInput) {
        //any cleanup logic goes here
        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak(alexaResponses.EXITING)
        .withShouldEndSession(true)
        .getResponse());
      }
    },
    LeeTema: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'LeeTema';
      },
      handle(handlerInput) {

        let machine;
        let msg;

        return Promise.resolve()
        .then(() => restoreCircular(handlerInput.attributesManager.getSessionAttributes().stateMachine) )
        .then(m => {
          machine = m;
          console.log(machine);
          return machine.dictate(handlerInput.requestEnvelope.request.intent.slots.NumeroTema.value);
        })
        .then(mensaje => {

          msg = mensaje;
          console.log(msg);
          return msg;
        })
        .then(() => handlerInput.responseBuilder
        .speak(msg)
        .reprompt(msg)
        .getResponse());
      }
    },
    HazTest: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'HazTest';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak('Este es el test del tema ' + handlerInput.requestEnvelope.request.intent.slots.NumeroTema.value || '')
        .reprompt('Este es el test del tema ' + handlerInput.requestEnvelope.request.intent.slots.NumeroTema.value || '')
        .getResponse());
      }
    },
    CorregirTest: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'CorregirTest';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak('Esta es la correción del tema ' + handlerInput.requestEnvelope.request.intent.slots.NumeroTema.value || '')
        .reprompt('Esta es la correción del tema ' + handlerInput.requestEnvelope.request.intent.slots.NumeroTema.value || '')
        .getResponse());
      }
    },
    RespondePregunta: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'RespondePregunta';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak('Esta es la respuesta dada a la pregunta ' + handlerInput.requestEnvelope.request.intent.slots.respuestaPregunta.value || '')
        .reprompt('Esta es la respuesta dada a la pregunta ' + handlerInput.requestEnvelope.request.intent.slots.respuestaPregunta.value || '')
        .getResponse());
      }
    },
    AyudaLeeTema: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AyudaLeeTema';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak(alexaResponses.HELP_LEE_TEMA)
        .reprompt(alexaResponses.HELP_LEE_TEMA)
        .getResponse());
      }
    },
    AyudaHazTest: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AyudaHazTest';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak(alexaResponses.HELP_HAZ_TEST)
        .reprompt(alexaResponses.HELP_HAZ_TEST)
        .getResponse());
      }
    },
    AyudaCorregirTest: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AyudaCorregirTest';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak(alexaResponses.HELP_CORREGIR_TEST)
        .reprompt(alexaResponses.HELP_CORREGIR_TEST)
        .getResponse());
      }
    },
    AyudaRespondePregunta: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AyudaRespondePregunta';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak(alexaResponses.HELP_RESPONDE_PREGUNTA)
        .reprompt(alexaResponses.HELP_RESPONDE_PREGUNTA)
        .getResponse());
      }
    },
    ErrorHandler: {
      canHandle() {

        return true;
      },
      handle(handlerInput, error) {

        error = removeCircular(error);
        
        return handlerInput.responseBuilder
        .speak(error.message)
        .reprompt(error.message)
        .getResponse();
      },
    }
  };

  return {
    alexaResponses,
    handlers,
    alexaStates,
    stateMachine
  };
};
