'use strict';

module.exports = app => {

  const themeModel = require('../model/themeModel')(app);
  const Promise = app.promise;
  const _ = app._;

  const errorLib = app.errorLib;
  const successLib = app.successLib;

  function getThemeList(filter, projections){

    return Promise.resolve()
    .then(() => themeModel.get(filter, projections) )
    .then( modelResp => {
      let resp = successLib.SUCCESS.GET;

      resp.json.obj = modelResp;

      return resp;
    })
    .catch(err => {

      if(themeModel.isThemeError(err)){

        switch (err) {
          case themeModel.ERROR.UNKNOWN: {

            throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['loginAdmin']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['loginAdmin']);
      }
    });
  }

  function getTheme(filter, projections){

    return Promise.resolve()
    .then(() => themeModel.getOne(filter, projections) )
    .then( modelResp => {
      let resp = successLib.SUCCESS.GET;

      resp.json.obj = modelResp;

      return resp;
    })
    .catch(err => {

      if(themeModel.isThemeError(err)){

        switch (err) {
          case themeModel.ERROR.UNKNOWN: {

            throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['getTheme']);
          }
          case themeModel.ERROR.NOT_FOUND: {

            throw errorLib.ERROR.NOT_FOUND(['getTheme']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['getTheme']);
      }
    });
  }

  function addNewTheme(body){

    return Promise.resolve()
    .then(() =>  themeModel.add(body) )
    .then(() => successLib.SUCCESS.NEW )
    .catch( err => {

      if(themeModel.isThemeError(err)){

        switch (err) {
          case themeModel.ERROR.CONFLICT: {

            throw errorLib.ERROR.CONFLICT(['addNewTheme']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['addNewTheme']);
      }
    });
  }

  function editTheme(themeId, body){

    return Promise.resolve()
    .then(() => themeModel.edit(themeId, body))
    .then(() => successLib.SUCCESS.UPDATE )
    .catch( err => {
      console.log(err);
      if(themeModel.isThemeError(err)){

        switch (err) {
          case themeModel.ERROR.CONFLICT: {

            throw errorLib.ERROR.CONFLICT(['editTheme']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['addNewTheme']);
      }
    });
  }

  function removeTheme(themeId){

    return Promise.resolve()
    .then(() =>  themeModel.rm({_id: themeId}) )
    .then(() => successLib.SUCCESS.DEL )
    .catch( err => {

      if(themeModel.isThemeError(err)){

        switch (err) {
          case themeModel.ERROR.NOT_FOUND: {

            throw errorLib.ERROR.NOT_FOUND(['removeTheme']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['removeTheme']);
      }
    });
  }

  function addNewQuestion(themeId, body){

    return Promise.resolve()
    .then(() => themeModel.addQuestion(themeId, body) )
    .then(() => successLib.SUCCESS.NEW)
    .catch( err => {

      if(themeModel.isThemeError(err)){

        switch (err) {
          case themeModel.ERROR.CONFLICT: {

            throw errorLib.ERROR.CONFLICT(['addNewQuestion']);
          }
          case themeModel.ERROR.NOT_FOUND: {

            throw errorLib.ERROR.NOT_FOUND(['addNewQuestion']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['addNewQuestion']);
      }
    });
  }

  function addNewSection(themeId, body){

    return Promise.resolve()
    .then(() => themeModel.addSection(themeId, body) )
    .then(() => successLib.SUCCESS.NEW)
    .catch( err => {

      if(themeModel.isThemeError(err)){

        switch (err) {
          case themeModel.ERROR.CONFLICT: {

            throw errorLib.ERROR.CONFLICT(['addNewSection']);
          }
          case themeModel.ERROR.NOT_FOUND: {

            throw errorLib.ERROR.NOT_FOUND(['addNewSection']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['addNewSection']);
      }
    });
  }

  function removeQuestion(themeId, body){

    return Promise.resolve()
    .then(() => themeModel.rmQuestion(themeId, body) )
    .then(() => successLib.SUCCESS.DEL)
    .catch( err => {

      if(themeModel.isThemeError(err)){

        switch (err) {
          case themeModel.ERROR.NOT_FOUND: {

            throw errorLib.ERROR.NOT_FOUND(['removeQuestion']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['removeQuestion']);
      }
    });
  }

  function removeSection(themeId, body){

    return Promise.resolve()
    .then(() => themeModel.rmSection(themeId, body) )
    .then(() => successLib.SUCCESS.DEL)
    .catch( err => {

      if(themeModel.isThemeError(err)){

        switch (err) {
          case themeModel.ERROR.NOT_FOUND: {

            throw errorLib.ERROR.NOT_FOUND(['removeSection']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['removeSection']);
      }
    });
  }

  return {
    getThemeList,
    getTheme,
    addNewTheme,
    editTheme,
    removeTheme,
    addNewQuestion,
    addNewSection,
    removeQuestion,
    removeSection
  };
};
