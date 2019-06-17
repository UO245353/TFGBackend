'use strict';

module.exports = app => {

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

        return handlerInput.responseBuilder
        .speak(alexaResponses.WELCOME)
        .reprompt(alexaResponses.WELCOME)
        .withSimpleCard('Bienvenido', alexaResponses.WELCOME)
        .getResponse();
      }
    },
    LeeTema: {
      canHandle(handlerInput) {
        console.log('LeeTema', handlerInput);
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'LeeTema';
      },
      handle(handlerInput) {

        return handlerInput.responseBuilder
        .speak('Este es el tema')
        .withSimpleCard('Tema', 'Este es el tema')
        .getResponse();
      }
    },
    HelpIntentHandler: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
      },
      handle(handlerInput) {

        return handlerInput.responseBuilder
        .speak(alexaResponses.HELP)
        .reprompt(alexaResponses.HELP)
        .withSimpleCard('Ayuda', alexaResponses.HELP)
        .getResponse();
      }
    },
    CancelAndStopIntentHandler: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
      },
      handle(handlerInput) {

        return handlerInput.responseBuilder
        .speak(alexaResponses.CANCEL)
        .withSimpleCard('Cancelar', alexaResponses.CANCEL)
        .getResponse();
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
    ErrorHandler: {
      canHandle() {

        return true;
      },
      handle(handlerInput, error) {
        console.log(`Error handled: ${error.message}`);

        return handlerInput.responseBuilder
        .speak('Sorry, I can\'t understand the command. Please say again.')
        .reprompt('Sorry, I can\'t understand the command. Please say again.')
        .getResponse();
      },
    }
  };

  return {
    alexaResponses,
    handlers
  };
};
