'use strict';

module.exports = app => {

  return new app.dbLib.dbAdapter().Schema({
    number: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }, {
    usePushEach: true
  });
};
