'use strict';

module.exports = app => {

  const jwt = require('jsonwebtoken');
  const Promise = app.promise;

  function token(opts){

    let token = false;

    try {
      token = jwt.sign(opts, app.config.secret, { expiresIn: '6h', issuer: 'uniovi' });
    }
    catch(e){}

    return token;
  }

  function verifyAndDecode(token){

    return new Promise((resolve, reject) => {
      jwt.verify(token, app.config.secret, function(err, decoded){
        if(!!err){
          reject(err);
        }
        else{
          resolve(decoded);
        }
      });
    });
  }

  return {
    token,
    verifyAndDecode
  };
};
