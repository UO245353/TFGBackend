'use strict';

module.exports = app => {

  const Promise = app.promise;
  const _ = app._;

  const tokenLib = require('./tokenLib')(app);

  function extracTokenFromRequest(req) {

    return (!!req.headers && !!req.headers.auth) ? req.headers.auth : false;
  }

  function checkAuth(token){

    return Promise.resolve()
    .then(() => tokenLib.verifyAndDecode(token))
    .then(token => token)
    .catch((err) => {

      throw err;
    });
  }

  return {
    extracTokenFromRequest,
    checkAuth
  };
};
