'use strict';

module.exports = app => {

  const _ = app._;
  const Promise = app.promise;

  const adminLib = require('../lib/adminLib')(app);
  const errorLib = app.errorLib;

  const MONGO_ID_LEN = app.dbLib.MONGO_ID_LEN;

  const validate = {};

  validate.adminLogin = (req, res, next) => {

    let errorIn = [];

    // Required data

    if(!_.every([req.body, req.body.name, req.body.pass], item => !_.isUndefined(item))){

      let error = errorLib.ERROR.BAD_REQUEST(['loginAdmin']);

      return res.status(error.code).json(error.json);
    }

    // Data analisis

    if(!adminLib.isValidName(req.body.name)){

      errorIn.push('name');
    }

    if(!adminLib.isValidPass(req.body.pass)){

      errorIn.push('pass');
    }

    // error analisis

    if(errorIn.length > 0){

      errorIn.push('loginAdmin');

      let error = errorLib.ERROR.UNPROCESSABLE_ENTITY(errorIn);

      return res.status(error.code).json(error.json);
    }

    next();
  };

  return {
    validate
  };
};
