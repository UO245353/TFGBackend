'use strict';

module.exports = app => {

  const _ = app._;
  const Promise = app.promise;

  const adminLib = require('../lib/adminLib')(app);
  const errorLib = app.errorLib;

  const MONGO_ID_LEN = app.dbLib.MONGO_ID_LEN;

  let validate = {};

  validate.newAdmin = (req, res, next) => {

    let errorIn = [];

    // Required data

    if(!_.every([req.body, req.body.name, req.body.pass, req.body.email], item => !_.isUndefined(item))){

      let error = errorLib.ERROR.BAD_REQUEST(['newAdmin']);

      return res.status(error.code).json(error.json);
    }

    // Data analisis

    if(!adminLib.isValidName(req.body.name)){

      errorIn.push('name');
    }

    if(!adminLib.isValidEmail(req.body.email)){

      errorIn.push('email');
    }

    if(!adminLib.isValidPass(req.body.pass)){

      errorIn.push('pass');
    }

    // error analisis

    if(errorIn.length > 0){

      errorIn.push('newAdmin');

      let error = errorLib.ERROR.UNPROCESSABLE_ENTITY(errorIn);

      return res.status(error.code).json(error.json);
    }

    next();
  };

  validate.editAdmin = (req, res, next) => {

    let errorIn = [];

    // Required data

    if(!req.body || _.isEmpty(req.body)){

      let error = errorLib.ERROR.BAD_REQUEST(['editAdmin']);

      return res.status(error.code).json(error.json);
    }

    // Data analisis

    if(!req.body.name || !adminLib.isValidName(req.body.name)){

      errorIn.push('name');
    }

    if(!req.body.email || !adminLib.isValidEmail(req.body.email)){

      errorIn.push('email');
    }

    if(!!req.body.pass && !adminLib.isValidPass(req.body.pass)){

      errorIn.push('pass');
    }

    // error analisis

    if(errorIn.length > 0){

      errorIn.push('editAdmin');

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
