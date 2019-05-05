'use strict';

module.exports = app => {

  const Promise = app.promise;
  const _ = app._;

  const authLib = require('../lib/authLib')(app);

  function checkAuth(req, res, next){

    let tokenFromRequest = authLib.extracTokenFromRequest(req);

    if(!tokenFromRequest){

      return res.status(app.errorLib.ERROR.UNAUTHORIZED().code).json(app.errorLib.ERROR.UNAUTHORIZED(['checkAuth']).json);
    }

    return Promise.resolve()
    .then(() => authLib.checkAuth(tokenFromRequest))
    .then(decoded => {

      req.decodedToken = decoded;
      next();
    })
    .catch((err) => {
      let error = app.errorLib.ERROR.UNAUTHORIZED(['checkAuth']);

      return res.status(error.code).json(error.json);
    });
   }

  return {
    checkAuth
  };
};
