'use strict';

module.exports = app => {

  const alexaResponses = {
    WELCOME: 'Bienvenido a Gestion t. i.',
    HELP: 'AYUUUUUDAAAA',
    CANCEL: 'Cancelado',
    NOT_SUPPORTED: 'Mo soportado'
  };

  const handlers = {
    launch: (alexa) => {

      return alexa.emit(
        ':ask',
        alexaResponses.WELCOME
      );
    },
    help: (alexa) => {

      return alexa.emit(
        ':ask',
        alexaResponses.HELP
      );
    },
    cancel: (alexa) => {

      return alexa.emit(
        'Speak',
        alexaResponses.CANCEL
      );
    }
  };

  return {
    alexaResponses,
    handlers
  };
};
