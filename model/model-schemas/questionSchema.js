'use strict';

module.exports = app => {

  return new app.dbLib.dbAdapter().Schema({
    number: {
      type: Number,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    responses: [
      {
        character: {
          type: String,
          required: true,
        },
        valid: {
          type: Boolean,
          required: true,
        },
        response: {
          type: String,
          required: true,
        },
      }
    ]
  }, {
    usePushEach: true
  });
};
