'use strict';

module.exports = app => {

  const adminController = require('../../../controller/adminController')(app);
  const authMiddleware = require('../../../middleware/authMiddleware')(app);
  const adminMiddleware = require('../../../middleware/adminMiddleware')(app);

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

  app.get('/api/admin',
  authMiddleware.checkAuth,
  (req, res) => {

    const projections = {
      _id: 1,
      name: 1,
      email: 1
    };

    return adminController.getAdminList(null, projections)
    .then( controllerResp => resSuccess(controllerResp, res))
    .catch( err => resErr(err, res));
  });

  app.get('/api/admin/:id',
  authMiddleware.checkAuth,
  adminMiddleware.validate.mongoId,
  (req, res) => {

    const projections = {
      _id: 1,
      name: 1,
      email: 1
    };

    return adminController.getAdmin({_id: req.params.id}, projections)
    .then( controllerResp => resSuccess(controllerResp, res))
    .catch( err => resErr(err, res));
  });

  app.post('/api/admin',
  authMiddleware.checkAuth,
  bodyParser.json(),
  adminMiddleware.validate.newAdmin,
  (req, res) => {

    return adminController.addNewAdmin(req.body)
    .then( controllerResp => resSuccess(controllerResp, res))
    .catch( err => resErr(err, res));
  });

  app.post('/api/admin/:id',
  authMiddleware.checkAuth,
  adminMiddleware.validate.mongoId,
  bodyParser.json(),
  adminMiddleware.validate.editAdmin,
  (req, res) => {

    return adminController.editAdmin(req.params.id ,req.body)
    .then( controllerResp => resSuccess(controllerResp, res) )
    .catch( err => resErr(err, res));
  });

  app.delete('/api/admin/:id',
  authMiddleware.checkAuth,
  adminMiddleware.validate.mongoId,
  (req, res) => {

    return adminController.removeAdmin(req.params.id ,req.body)
    .then( controllerResp => resSuccess(controllerResp, res) )
    .catch( err => resErr(err, res));
  });
};
