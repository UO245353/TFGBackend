'use strict';

module.exports = app => {

  const loginController = require('../../../controller/loginController')(app);
  const loginMiddleware = require('../../../middleware/loginMiddleware')(app);

  const _ = app._;
  const Promise = app.promise;

  const bodyParser = require('body-parser');

  function resErr(err, res){

    if(app.errorLib.isKnownError(err)){

      return res.status(err.code).json(err.json);
    }

    throw err;
  }

  function resSuccess(controllerResp, res){

    return res.status(controllerResp.code).json(controllerResp.json);
  }

  app.post('/api/login/admin',
  bodyParser.json(),
  loginMiddleware.validate.adminLogin,
  (req, res) => {
    
    return loginController.loginAdmin(req.body)
    .then( controllerResp => resSuccess(controllerResp, res))
    .catch( err => resErr(err, res));
  });
};
