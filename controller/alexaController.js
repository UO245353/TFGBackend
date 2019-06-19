'use strict';

module.exports = app => {

  const themeModel = require('../model/themeModel')(app);
  const Promise = app.promise;
  const _ = app._;

  const ERROR = {
    NO_CONTENT: '31',
    NO_QUESTION: '32'
  };

  function getThemeContent(themeNumber){

    function castSectionsToContent(sections){
      if(!sections){

        throw ERROR.NO_CONTENT;
      }

      let content = '';

      _.each(sections, section => {

        content += '\n\n' + section.title + '\n\n' + section.content;
      });

      return content;
    }

    return Promise.resolve()
    .then(() => themeModel.getOne({number: themeNumber}, {sections: 1}))
    .then(theme => castSectionsToContent(theme.sections));
  }

  function getThemeQuestionsCorrected(themeNumber){

    function castSectionsToContent(questions){
      if(!questions){

        throw ERROR.NO_QUESTIONS;
      }

      let correctedQuestions = '';

      _.each(questions, question => {
        let validResp = _.find(question.responses, resp => resp.valid);

        correctedQuestions += 'Pregunta: \n\n' + question.question + 'Respuesta correcta: \n\n' + validResp.character + '. ' + validResp.response;
      });

      return content;
    }

    return Promise.resolve()
    .then(() => themeModel.getOne({number: themeNumber}, {questions: 1}))
    .then(theme => castSectionsToContent(theme.questions));
  }

  return {
    getThemeQuestionsCorrected,
    getThemeContent,
    ERROR
  };
};
