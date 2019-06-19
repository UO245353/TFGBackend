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

    function castQuestionsToQuestionsCorrected(questions){
      if(!questions){

        throw ERROR.NO_QUESTION;
      }

      let correctedQuestions = '';

      _.each(questions, question => {
        let validResp = _.find(question.responses, resp => resp.valid);

        let responsesString = '';

        _.each(question.responses, resp => {

          responsesString =+ '\n\n' + resp.character + ' \n\n ' + resp.response + ' \n\n';
        });

        correctedQuestions += '\n\nPregunta ' + question.number+ ':\n\n '+ question.question + '\n\nRespuestas: \n\n' +responsesString + '\n\nRespuesta correcta: \n\n' + validResp.character + '\n\n' + validResp.response;
      });

      return correctedQuestions;
    }

    return Promise.resolve()
    .then(() => themeModel.getOne({number: themeNumber}, {questions: 1}))
    .then(theme => castQuestionsToQuestionsCorrected(theme.questions));
  }

  return {
    getThemeQuestionsCorrected,
    getThemeContent,
    ERROR
  };
};
