'use strict';

module.exports = app => {

  const questionSchema = require('./questionSchema')(app);
  const sectionSchema = require('./sectionSchema')(app);

  return new app.dbLib.dbAdapter().Schema({
    number: {
      type: Number,
      unique: true,
      required: true
    },
    title: {
      type: String,
      unique: true,
      required: true
    },
    questions: [
      {
        type: questionSchema,
        required: false
      }
    ],
    sections: [
      {
        type: sectionSchema,
        required: false
      }
    ]
  }, {
    usePushEach: true
  });
};
