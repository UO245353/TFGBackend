'use strict';

module.exports = app => {

  const Promise = app.promise;
  const _ = app._;

  const tokenLib = require('./tokenLib')(app);

  const adminModel = require('../model/adminModel')(app);

  function extracTokenFromRequest(req) {

    return (!!req.headers && !!req.headers.auth) ? req.headers.auth : false;
  }

  function checkAuth(token){

    return Promise.resolve()
    .then(() => tokenLib.verifyAndDecode(token))
    .then(token => {
      
      if(token._id === 'superuser' && token.name === app.config.superUserData.username){

        return token;
      }

      return adminModel.exist({_id: token._id, name: token.name})
      .then(exist => {

        if(!!exist){

          return token;
        }

        throw exist;
      });
    })
    .catch((err) => {

      throw err;
    });
  }

  return {
    extracTokenFromRequest,
    checkAuth
  };
};
