'use strict';

module.exports = app => {

  let _ = app._;

  function isValidNumber(number){

    if(!_.isNumber(number)){

      return false;
    }

    return /^\d{1,}$/.test(number);
  }

  function isValidTitle(title){

    if(!_.isString(title)){

      return false;
    }

    return /^.{1,}$/.test(title);
  }

  function isValidQuestion(question){

    if(!_.isString(question)){

      return false;
    }

    return /^.{1,}$/.test(question);
  }

  function isValidContent(content){

        if(!_.isString(content)){

          return false;
        }

        return /^.{1,}/.test(content);
  }

  function areValidResponses(responses){

    if(!_.isArray(responses)){

      return false;
    }

    return _.every(responses, response => {

      if(!_.every([response, response.character, response.valid, response.response], item => !_.isUndefined(item))){

        return false;
      }

      const CHARACTER_REGEX = /^[a-zA-Z]{1}$/;
      const VALID_REGEX = {test: (item) => _.isBoolean(item)};
      const RESPONSE_REGEX = {test: (item) => _.isString(item) && item.length > 0};

      if(CHARACTER_REGEX.test(response.character) && VALID_REGEX.test(response.valid) && RESPONSE_REGEX.test(response.response)){

        return true;
      }

      return false;
    });
  }

  return {
    isValidNumber,
    isValidTitle,
    isValidQuestion,
    isValidContent,
    areValidResponses
  };
};
