'use strict';

module.exports = app => {

  const Promise = app.promise;

  const alexaResponses = {
    WELCOME: 'Bienvenido a Gestión de Tecnologías de la Información',
    HELP: 'Los comandos admitidos son:\nLéeme o Díctame el tema X.\n Hazme un examen del tema X.\n Y dame las soluciones o corrige el tema X.\n\n Si tienes dudas con algunos de los comandos puedes pedir ayuda para cada uno de ellos, por ejemplo.\n Ayúdame con Léeme el tema',
    CANCEL: 'Cancelado',
    NOT_SUPPORTED: 'Mo soportado'
  };

  const handlers = {
    LaunchRequestHandler: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
      },
      handle(handlerInput) {

        return Promise.resolve()
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
    SessionEndedRequestHandler: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
      },
      handle(handlerInput) {
        //any cleanup logic goes here
        return handlerInput.responseBuilder.getResponse();
      }
    },
    LeeTema: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'LeeTema';
      },
      handle(handlerInput) {

        return Promise.resolve()
        .then(() => handlerInput.responseBuilder
        .speak('Este es el tema ' + handlerInput.requestEnvelope.request.intent.slots.NumeroTema.value || '')
        .reprompt('Este es el tema ' + handlerInput.requestEnvelope.request.intent.slots.NumeroTema.value || '')
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
    ErrorHandler: {
      canHandle() {

        return true;
      },
      handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
        .speak(alexaResponses.NOT_SUPPORTED)
        .getResponse();
      },
    }
  };

  return {
    alexaResponses,
    handlers
  };
};
