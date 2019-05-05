'use strict';

module.exports = app => {

  const _ = app._;

  function isValidName(name){

    if(!_.isString(name)){

      return false;
    }

    return /^.{3,}$/.test(name);
  }

  function isValidEmail(email){

    if(!_.isString(email)){

      return false;
    }

    return /^.{1,}@.{1,}\..{1,}$/.test(email);
  }

  function isValidPass(pass){

    if(!_.isString(pass)){

      return false;
    }

    return /^(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s])[A-Za-z\d]|[^a-zA-Z\d\s]{6,15}/.test(pass);
  }

  return {
    isValidName,
    isValidEmail,
    isValidPass
  };
};
