'use strict';

module.exports = app => {

  const adminModel = require('../model/adminModel')(app);
  const Promise = app.promise;
  const _ = app._;

  const cryptoLib = require('../lib/cryptoLib')(app);

  const errorLib = app.errorLib;
  const successLib = app.successLib;

  function getAdminList(filter, projections){

    return Promise.resolve()
    .then(() => adminModel.get(filter, projections) )
    .then( modelResp => {
      let resp = successLib.SUCCESS.GET;

      resp.json.obj = modelResp;

      return resp;
    })
    .catch(err => {

      if(adminModel.isAdminError(err)){

        switch (err) {
          case adminModel.ERROR.UNKNOWN: {

            throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['getAdminList']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['getAdminList']);
      }
    });
  }

  function getAdmin(filter, projections){

    return Promise.resolve()
    .then(() => adminModel.getOne(filter, projections) )
    .then( modelResp => {
      let resp = successLib.SUCCESS.GET;

      resp.json.obj = modelResp;

      return resp;
    })
    .catch(err => {

      if(adminModel.isAdminError(err)){

        switch (err) {
          case adminModel.ERROR.UNKNOWN: {

            throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['getAdmin']);
          }
          case adminModel.ERROR.NOT_FOUND: {

            throw errorLib.ERROR.NOT_FOUND(['getAdmin']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['getAdmin']);
      }
    });
  }

  function addNewAdmin(body){

    return Promise.resolve()
    .then(() => cryptoLib.salt())
    .then(salt => cryptoLib.hash(salt, body.pass) )
    .catch( err => {

      throw adminModel.ERROR.UNKNOWN(['addNewAdmin']);
    })
    .then(pass => {
      body.pass = pass;
      return adminModel.add(body);
    })
    .then( modelResp => successLib.SUCCESS.NEW )
    .catch( err => {

      if(adminModel.isAdminError(err)){

        switch (err) {
          case adminModel.ERROR.CONFLICT: {

            throw errorLib.ERROR.CONFLICT(['addNewAdmin']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['addNewAdmin']);
      }
    });

  }

  function editAdmin(id, body){

    return Promise.resolve()
    .then(() => adminModel.exist({_id: id}) )
    .then( exist => {

      if(!exist){

        throw adminModel.ERROR.NOT_FOUND(['editAdmin']);
      }

      if(!body.pass){

        return false;
      }

      return Promise.resolve()
      .then(() => cryptoLib.salt() )
      .then(salt => cryptoLib.hash(salt, body.pass) )
      .catch( err => {

        throw adminModel.ERROR.UNKNOWN(['editAdmin']);
      });
    })
    .then(pass => {

      if(!!pass){
        body.pass = pass;
      }

      return adminModel.edit({_id: id}, body);
    })
    .then( modelResp => successLib.SUCCESS.UPDATE)
    .catch( err => {
      console.log('controller',err);
      if(adminModel.isAdminError(err)){

        switch (err) {
          case adminModel.ERROR.CONFLICT: {

            throw errorLib.ERROR.CONFLICT(['editAdmin']);
          }
          case adminModel.ERROR.UNKNOWN: {

            throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['editAdmin']);
          }
          case adminModel.ERROR.NOT_FOUND: {

            throw errorLib.ERROR.NOT_FOUND(['editAdmin']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['editAdmin']);
      }
    });
  }

  function removeAdmin(id){

    return Promise.resolve()
    .then(() => {

      return adminModel.rm({_id: id});
    })
    .then( modelResp => successLib.SUCCESS.DEL)
    .catch( err => {

      if(adminModel.isAdminError(err)){

        switch (err) {
          case adminModel.ERROR.UNKNOWN: {

            throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['editAdmin']);
          }
          case adminModel.ERROR.NOT_FOUND: {

            throw errorLib.ERROR.NOT_FOUND(['editAdmin']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['editAdmin']);
      }
    });
  }

  return {
    getAdminList,
    getAdmin,
    addNewAdmin,
    editAdmin,
    removeAdmin
  };
};
