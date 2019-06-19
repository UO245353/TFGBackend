'use strict';

module.exports = app => {

  const Promise = app.promise;
  const alexaController = require('../controller/alexaController')(app);
  const themeModelError = require('../model/themeModel')(app).ERROR;

  function getDataToSaveFromMachine(machine){

    return {
      state: machine.state,
      sessionId: machine.sessionId,
      themeNumber: machine.themeNumber,
      questionNumber: machine.questionNumber,
      rightAnswers: machine.rightAnswers,
      wrongAnswers: machine.wrongAnswers
    };
  }

  function getMachineFromSessionData(data){

    let machine = new stateMachine({
      themeNumber: data.themeNumber,
      questionNumber: data.questionNumber,
      sessionId: data.sessionId,
      rightAnswers: data.rightAnswers,
      wrongAnswers: data.wrongAnswers
    });

    machine.goto(data.state);

    return machine;
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
    NOT_SUPPORTED: 'No soportado',
    IMPOSIBLE_ACTION: 'El comando requerido no esta disponible en este momento',
    ERROR: {
      NO_CONTENT: 'El tema no tiene contenidos disponibles',
      NO_QUESTION: 'El tema no tiene preguntas disponibles',
      THEME_NOT_FOUND: 'El tema no se ha encontrado'
    }
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
    GOTO: {
      name: 'goto',
      from: '*',
      to: function(s) { return s; }
    }
  };

  const stateMachine = require('javascript-state-machine').factory({
    init: alexaStates.WAITING,
    transitions: [
      alexaTransitions.DICTATE,
      alexaTransitions.TEST,
      alexaTransitions.CORRECT,
      alexaTransitions.ASNWER,
      alexaTransitions.BACK,
      alexaTransitions.GOTO,
    ],
    data: function(options) {

      return {
        sessionId: options.sessionId,
        themeNumber: options.themeNumber,
        questionNumber: options.questionNumber,
        rightAnswers: options.rightAnswers,
        wrongAnswers: options.wrongAnswers
      };
    },
    methods: {
      onDictate: function(lifecycle, thNumber){
        this.themeNumber = thNumber;
        // find and return formated theme string
        return Promise.resolve()
        .then(() => alexaController.getThemeContent(this.themeNumber) )
        .catch(err => {
          throw err;
        });
      },
      onTest: function(lifecycle, thNumber){
        this.themeNumber = thNumber;
        this.questionNumber = 0;
        this.rightAnswers = 0;
        this.wrongAnswers = 0;

        // find and return formated theme string
        return Promise.resolve()
        .then(() => alexaController.getThemeFirstQuestion(this.themeNumber) )
        .catch(err => {
          throw err;
        });
      },
      onAnswer: function(lifecycle, response){
        // find and return formated theme string
        return Promise.resolve()
        .then(() => alexaController.validateResponse(this.themeNumber, this.questionNumber, response) )
        .then(resp => {
          if(resp){
            this.rightAnswers += 1;
          }
          else {
            this.wrongAnswers += -1;
          }

          return alexaController.getThemeNextQuestion(this.themeNumber, this.questionNumber);
        })
        .then(nextQuestionFormatted => {

          this.questionNumber += 1;

          return nextQuestionFormatted;
        })
        .catch(err => {

          if(err === alexaController.ERROR.NO_MORE_QUESTIONS){

            this.questionNumber = undefined;

            return 'Examen finalizado, has acertado ' + this.rightAnswers + ', has fallado ' + this.wrongAnswers;
          }

          throw err;
        });
      },
      onCorrect: function(lifecycle, thNumber){

        this.themeNumber = thNumber;
        // find and return formated theme string
        return Promise.resolve()
        .then(() => alexaController.getThemeQuestionsCorrected(this.themeNumber) )
        .catch(err => {
          throw err;
        });
      },
      onBack: function(){
        this.themeNumber = undefined;
        this.questionNumber = undefined;
        this.rightAnswers = undefined;
        this.wrongAnswers = undefined;

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
        .then(() => new stateMachine({sessionId: handlerInput.requestEnvelope.session.sessionId}))
        .then(machine => handlerInput.attributesManager.setSessionAttributes({stateMachine: getDataToSaveFromMachine(machine) }) )
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

        let actualStateMachine;

        return Promise.resolve()
        .then(() => getMachineFromSessionData(handlerInput.attributesManager.getSessionAttributes().stateMachine) )
        .then(sessionMachine => {

          actualStateMachine = sessionMachine;

          return actualStateMachine.goto(alexaStates.WAITING);
        })
        .then(() => handlerInput.responseBuilder
        .speak(alexaResponses.CANCEL)
        .reprompt(alexaResponses.CANCEL)
        .getResponse())
        .then(resp => {

          handlerInput.attributesManager.setSessionAttributes({stateMachine: getDataToSaveFromMachine(actualStateMachine) });

          return resp;
        });
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
        .reprompt(alexaResponses.EXITING)
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
        .reprompt(alexaResponses.EXITING)
        .withShouldEndSession(true)
        .getResponse());
      }
    },
    LeeTema: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'LeeTema';
      },
      handle(handlerInput) {

        let themeNumber = handlerInput.requestEnvelope.request.intent.slots.NumeroTema.value;
        let mensaje = '';
        let actualStateMachine;

        return Promise.resolve()
        .then(() => getMachineFromSessionData(handlerInput.attributesManager.getSessionAttributes().stateMachine) )
        .then(sessionMachine => {

          actualStateMachine = sessionMachine;

          return (actualStateMachine.can(alexaTransitions.DICTATE.name)) ? actualStateMachine.dictate(themeNumber) : alexaResponses.IMPOSIBLE_ACTION;
        })
        .catch(err => {

          if(err === alexaController.ERROR.NO_CONTENT){

            return alexaResponses.ERROR.NO_CONTENT;
          }

          if(err === themeModelError.NOT_FOUND){

            return alexaResponses.ERROR.THEME_NOT_FOUND;
          }

          throw err;
        })
        .then(result => {
          mensaje = result;

          return;
        })
        .then(() => handlerInput.responseBuilder
        .speak(mensaje)
        .reprompt(mensaje)
        .getResponse())
        .then(resp => {

          if(mensaje !== alexaResponses.IMPOSIBLE_ACTION){
            actualStateMachine.back();
          }

          handlerInput.attributesManager.setSessionAttributes({stateMachine: getDataToSaveFromMachine(actualStateMachine) });

          return resp;
        });
      }
    },
    HazTest: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'HazTest';
      },
      handle(handlerInput) {

        let themeNumber = handlerInput.requestEnvelope.request.intent.slots.NumeroTema.value;
        let mensaje = '';
        let actualStateMachine;

        return Promise.resolve()
        .then(() => getMachineFromSessionData(handlerInput.attributesManager.getSessionAttributes().stateMachine) )
        .then(sessionMachine => {

          actualStateMachine = sessionMachine;

          return (actualStateMachine.can(alexaTransitions.TEST.name)) ? actualStateMachine.test(themeNumber) : alexaResponses.IMPOSIBLE_ACTION;
        })
        .catch(err => {


          if(err === alexaController.ERROR.NO_QUESTION){

            return alexaResponses.ERROR.NO_QUESTION;
          }

          if(err === themeModelError.NOT_FOUND){

            return alexaResponses.ERROR.THEME_NOT_FOUND;
          }

          throw err;
        })
        .then(result => {
          mensaje = result;

          return;
        })
        .then(() => handlerInput.responseBuilder
        .speak(mensaje)
        .reprompt(mensaje)
        .getResponse())
        .then(resp => {

          if(resp === alexaResponses.ERROR.NO_QUESTION || resp === alexaResponses.ERROR.THEME_NOT_FOUND){
            actualStateMachine.back();
          }

          handlerInput.attributesManager.setSessionAttributes({stateMachine: getDataToSaveFromMachine(actualStateMachine) });

          return resp;
        });
      }
    },
    CorregirTest: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'CorregirTest';
      },
      handle(handlerInput) {

        let themeNumber = handlerInput.requestEnvelope.request.intent.slots.NumeroTema.value;
        let mensaje = '';
        let actualStateMachine;

        return Promise.resolve()
        .then(() => getMachineFromSessionData(handlerInput.attributesManager.getSessionAttributes().stateMachine) )
        .then(sessionMachine => {

          actualStateMachine = sessionMachine;

          return (actualStateMachine.can(alexaTransitions.CORRECT.name)) ? actualStateMachine.correct(themeNumber) : alexaResponses.IMPOSIBLE_ACTION;
        })
        .catch(err => {

          if(err === alexaController.ERROR.NO_QUESTION){

            return alexaResponses.ERROR.NO_QUESTION;
          }

          if(err === themeModelError.NOT_FOUND){

            return alexaResponses.ERROR.THEME_NOT_FOUND;
          }

          throw err;
        })
        .then(result => {
          mensaje = result;

          return;
        })
        .then(() => handlerInput.responseBuilder
        .speak(mensaje)
        .reprompt(mensaje)
        .getResponse())
        .then(resp => {

          if(mensaje !== alexaResponses.IMPOSIBLE_ACTION){
            actualStateMachine.back();
          }

          handlerInput.attributesManager.setSessionAttributes({stateMachine: getDataToSaveFromMachine(actualStateMachine) });

          return resp;
        });
      }
    },
    RespondePregunta: {
      canHandle(handlerInput) {

        return handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'RespondePregunta';
      },
      handle(handlerInput) {

        let responseCharacter = handlerInput.requestEnvelope.request.intent.slots.respuestaPregunta.value;
        let mensaje = '';
        let actualStateMachine;

        return Promise.resolve()
        .then(() => getMachineFromSessionData(handlerInput.attributesManager.getSessionAttributes().stateMachine) )
        .then(sessionMachine => {

          actualStateMachine = sessionMachine;

          return (actualStateMachine.can(alexaTransitions.ASNWER.name)) ? actualStateMachine.answer(responseCharacter) : alexaResponses.IMPOSIBLE_ACTION;
        })
        .catch(err => {


          if(err === alexaController.ERROR.NO_QUESTION){

            return alexaResponses.ERROR.NO_QUESTION;
          }

          if(err === themeModelError.NOT_FOUND){

            return alexaResponses.ERROR.THEME_NOT_FOUND;
          }

          throw err;
        })
        .then(result => {
          mensaje = result;

          return;
        })
        .then(() => handlerInput.responseBuilder
        .speak(mensaje)
        .reprompt(mensaje)
        .getResponse())
        .then(resp => {

          if(resp.indexOf('Examen finalizado, has acertado') > -1){
            actualStateMachine.back();
          }

          handlerInput.attributesManager.setSessionAttributes({stateMachine: getDataToSaveFromMachine(actualStateMachine) });

          return resp;
        });
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
