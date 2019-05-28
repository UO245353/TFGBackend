'use strict';

module.exports = app => {

  const themeController = require('../../../controller/themeController')(app);
  const authMiddleware = require('../../../middleware/authMiddleware')(app);
  const themeMiddleware = require('../../../middleware/themeMiddleware')(app);

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

  app.get('/api/theme',
  authMiddleware.checkAuth,
  (req, res) => {

    const projections = {
      _id: 1,
      number: 1,
      title: 1,
      questions: 1,
      sections: 1
    };

    return themeController.getThemeList(null, projections)
    .then( controllerResp => resSuccess(controllerResp, res))
    .catch( err => resErr(err, res));
  });

  app.get('/api/theme/:id',
  authMiddleware.checkAuth,
  themeMiddleware.validate.mongoId,
  (req, res) => {

    const projections = {
      _id: 1,
      number: 1,
      title: 1,
      questions: 1,
      sections: 1
    };

    return themeController.getTheme({_id: req.params.id}, projections)
    .then( controllerResp => resSuccess(controllerResp, res))
    .catch( err => resErr(err, res));
  });

  app.post('/api/theme',
  authMiddleware.checkAuth,
  bodyParser.json(),
  themeMiddleware.validate.newTheme,
  (req, res) => {

    return themeController.addNewTheme(req.body)
    .then( controllerResp => resSuccess(controllerResp, res))
    .catch( err => resErr(err, res));
  });

  app.post('/api/theme/:id',
  authMiddleware.checkAuth,
  bodyParser.json(),
  themeMiddleware.validate.editTheme,
  (req, res) => {

    return themeController.editTheme(req.params.id, req.body)
    .then( controllerResp => resSuccess(controllerResp, res))
    .catch( err => resErr(err, res));
  });

  app.post('/api/theme/:id/question',
  authMiddleware.checkAuth,
  themeMiddleware.validate.mongoId,
  bodyParser.json(),
  themeMiddleware.validate.newQuestion,
  (req, res) => {

    return themeController.addNewQuestion(req.params.id ,req.body)
    .then( controllerResp => resSuccess(controllerResp, res) )
    .catch( err => resErr(err, res));
  });

  app.post('/api/theme/:id/section',
  authMiddleware.checkAuth,
  themeMiddleware.validate.mongoId,
  bodyParser.json(),
  themeMiddleware.validate.newSection,
  (req, res) => {

    return themeController.addNewSection(req.params.id ,req.body)
    .then( controllerResp => resSuccess(controllerResp, res) )
    .catch( err => resErr(err, res));
  });

  app.delete('/api/theme/:id',
  authMiddleware.checkAuth,
  themeMiddleware.validate.mongoId,
  (req, res) => {

    return themeController.removeTheme(req.params.id)
    .then( controllerResp => resSuccess(controllerResp, res))
    .catch( err => resErr(err, res));
  });

  app.delete('/api/theme/:id/question',
  authMiddleware.checkAuth,
  themeMiddleware.validate.mongoId,
  bodyParser.json(),
  themeMiddleware.validate.rmQuestion,
  (req, res) => {

    return themeController.removeQuestion(req.params.id ,req.body)
    .then( controllerResp => resSuccess(controllerResp, res) )
    .catch( err => resErr(err, res));
  });

  app.delete('/api/theme/:id/section',
  authMiddleware.checkAuth,
  themeMiddleware.validate.mongoId,
  bodyParser.json(),
  themeMiddleware.validate.rmSection,
  (req, res) => {

    return themeController.removeSection(req.params.id ,req.body)
    .then( controllerResp => resSuccess(controllerResp, res) )
    .catch( err => resErr(err, res));
  });
};
