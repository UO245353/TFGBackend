'use strict';

module.exports = app => {

  return new app.dbLib.dbAdapter().Schema({
    name: {
      type: String,
      unique: true,
      required: true
    },
    pass: String,
    email: String
  }, {
    usePushEach: true
  });
};
