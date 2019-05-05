'use strict';

module.exports = app => {

  const _ = app._;
  const Promise = app.promise;

  const themeLib = require('../lib/themeLib')(app);
  const errorLib = app.errorLib;

  const MONGO_ID_LEN = app.dbLib.MONGO_ID_LEN;

  let validate = {};

  validate.newTheme = (req, res, next) => {

    let errorIn = [];

    // Required data

    if(!_.every([req.body, req.body.number, req.body.title], item => !_.isUndefined(item))){

      let error = errorLib.ERROR.BAD_REQUEST(['newTheme']);

      return res.status(error.code).json(error.json);
    }

    // Data analisis

    if(!themeLib.isValidNumber(req.body.number)){

      errorIn.push('number');
    }

    if(!themeLib.isValidTitle(req.body.title)){

      errorIn.push('title');
    }

    // error analisis

    if(errorIn.length > 0){

      errorIn.push('newTheme');

      let error = errorLib.ERROR.UNPROCESSABLE_ENTITY(errorIn);

      return res.status(error.code).json(error.json);
    }

    next();
  };

  validate.newQuestion = (req, res, next) => {

    let errorIn = [];

    // Required data

    if(!_.every([req.body, req.body.number, req.body.question, req.body.responses], item => !_.isUndefined(item))){

      let error = errorLib.ERROR.BAD_REQUEST(['newQuestion']);

      return res.status(error.code).json(error.json);
    }

    // Data analisis

    if(!themeLib.isValidNumber(req.body.number)){

      errorIn.push('number');
    }

    if(!themeLib.isValidQuestion(req.body.question)){

      errorIn.push('question');
    }

    if(!themeLib.areValidResponses(req.body.responses)){

      errorIn.push('responses');
    }

    // error analisis

    if(errorIn.length > 0){

      errorIn.push('newQuestion');

      let error = errorLib.ERROR.UNPROCESSABLE_ENTITY(errorIn);

      return res.status(error.code).json(error.json);
    }

    next();
  };

  validate.newSection = (req, res, next) => {

    let errorIn = [];

    // Required data
    if(!_.every([req.body, req.body.number, req.body.title, req.body.content], item => !_.isUndefined(item))){

      let error = errorLib.ERROR.BAD_REQUEST(['newSection']);

      return res.status(error.code).json(error.json);
    }

    // Data analisis

    if(!themeLib.isValidNumber(req.body.number)){

      errorIn.push('number');
    }

    if(!themeLib.isValidTitle(req.body.title)){

      errorIn.push('title');
    }

    if(!themeLib.isValidContent(req.body.content)){

      errorIn.push('content');
    }

    // error analisis

    if(errorIn.length > 0){

      errorIn.push('newSection');

      let error = errorLib.ERROR.UNPROCESSABLE_ENTITY(errorIn);

      return res.status(error.code).json(error.json);
    }

    next();
  };

  validate.rmQuestion = (req, res, next) => {

    let errorIn = [];

    // Required data

    if(!_.every([req.body, req.body.number, req.body.question], item => !_.isUndefined(item))){

      let error = errorLib.ERROR.BAD_REQUEST(['rmQuestion']);

      return res.status(error.code).json(error.json);
    }

    // Data analisis

    if(!themeLib.isValidNumber(req.body.number)){

      errorIn.push('number');
    }

    if(!themeLib.isValidQuestion(req.body.question)){

      errorIn.push('question');
    }

    // error analisis

    if(errorIn.length > 0){

      errorIn.push('rmQuestion');

      let error = errorLib.ERROR.UNPROCESSABLE_ENTITY(errorIn);

      return res.status(error.code).json(error.json);
    }

    next();
  };

  validate.rmSection = (req, res, next) => {

    let errorIn = [];

    // Required data
    if(!_.every([req.body, req.body.number, req.body.title], item => !_.isUndefined(item))){

      let error = errorLib.ERROR.BAD_REQUEST(['rmSection']);

      return res.status(error.code).json(error.json);
    }

    // Data analisis

    if(!themeLib.isValidNumber(req.body.number)){

      errorIn.push('number');
    }

    if(!themeLib.isValidTitle(req.body.title)){

      errorIn.push('title');
    }

    // error analisis

    if(errorIn.length > 0){

      errorIn.push('rmSection');

      let error = errorLib.ERROR.UNPROCESSABLE_ENTITY(errorIn);

      return res.status(error.code).json(error.json);
    }

    next();
  };

  validate.mongoId = (req, res, next) => {

    if(req.params.id.length !== MONGO_ID_LEN){

      let error = errorLib.ERROR.UNPROCESSABLE_ENTITY(['validate mongoId']);

      return res.status(error.code).json(error.json);
    }

    next();
  };

  return {
    validate
  };
};
