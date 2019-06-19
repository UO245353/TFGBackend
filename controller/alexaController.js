'use strict';

module.exports = app => {

  const themeModel = require('../model/themeModel')(app);
  const Promise = app.promise;
  const _ = app._;

  const ERROR = {
    NO_CONTENT: '31',
    NO_QUESTION: '32',
    NO_MORE_QUESTIONS: '33'
  };

  function getThemeContent(themeNumber){

    function castSectionsToContent(sections){
      if(!sections || sections.length < 1){

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
      if(!questions || questions.length < 1){

        throw ERROR.NO_QUESTION;
      }

      let correctedQuestions = '';

      _.each(questions, question => {

        let validResp = _.find(question.responses, resp => resp.valid);

        let responsesString = '';

        _.each(question.responses, resp => {

          responsesString += '\n\n ' + resp.character + ' \n\n ' + resp.response + ' \n\n';

          return;
        });

        correctedQuestions += '\n\n Pregunta ' + question.number+ ':\n\n '+ question.question + '\n\nRespuestas: \n\n' +responsesString + '\n\nRespuesta correcta: \n\n' + validResp.character + '\n\n' + validResp.response;
      });

      return correctedQuestions;
    }

    return Promise.resolve()
    .then(() => themeModel.getOne({number: themeNumber}, {questions: 1}))
    .then(theme => castQuestionsToQuestionsCorrected(theme.questions));
  }

  function getThemeFirstQuestion(themeNumber){

    function castQuestionsToFirstQuestionFormatted(questions){
      if(!questions || questions.length < 1){

        throw ERROR.NO_QUESTION;
      }

      let questionFormatted = '';
      let responsesString = '';

        _.each(questions[0].responses, resp => {

          responsesString += '\n\n ' + resp.character + ' \n\n ' + resp.response + ' \n\n';

          return;
        });

        questionFormatted += 'Pregunta ' + questions[0].number+ ':\n\n '+ questions[0].question + '\n\nRespuestas: \n\n' +responsesString + '\n\n';


      return questionFormatted;
    }

    return Promise.resolve()
    .then(() => themeModel.getOne({number: themeNumber}, {questions: 1}))
    .then(theme => castQuestionsToFirstQuestionFormatted(theme.questions));
  }

  function getThemeNextQuestion(themeNumber, questionNumber){

    function castQuestionsToNextQuestionFormatted(questions, questionNumber){
      if(!questions || questions.length < 1){

        throw ERROR.NO_QUESTION;
      }

      if(questionNumber + 1 >= questions.length){

        throw ERROR.NO_MORE_QUESTIONS;
      }

      let questionFormatted = '';
      let responsesString = '';

        _.each(questions[questionNumber + 1].responses, resp => {

          responsesString += '\n\n ' + resp.character + ' \n\n ' + resp.response + ' \n\n';

          return;
        });

        questionFormatted += 'Pregunta ' + questions[questionNumber + 1].number+ ':\n\n '+ questions[questionNumber + 1].question + '\n\nRespuestas: \n\n' +responsesString + '\n\n';


      return questionFormatted;
    }

    return Promise.resolve()
    .then(() => themeModel.getOne({number: themeNumber}, {questions: 1}))
    .then(theme => castQuestionsToNextQuestionFormatted(theme.questions, questionNumber));
  }

  function validateResponse(themeNumber, questionNumber, response){

    function validate(questions, questionNumber, response){
      if(!questions || questions.length < 1){

        throw ERROR.NO_QUESTION;
      }

      if(questionNumber >= questions.length){

        throw ERROR.NO_MORE_QUESTIONS;
      }

      return _.find(questions[questionNumber].responses, resp => resp.valid).character.toLowerCase() === response.toLowerCase();
    }

    return Promise.resolve()
    .then(() => themeModel.getOne({number: themeNumber}, {questions: 1}))
    .then(theme => validate(theme.questions, questionNumber, response));
  }

  return {
    getThemeQuestionsCorrected,
    getThemeFirstQuestion,
    getThemeNextQuestion,
    getThemeContent,
    validateResponse,
    ERROR
  };
};
