'use strict';

module.exports = app => {

  const _ = app._;
  const Promise = app.promise;

  const bcrypt = require('bcrypt');

  function hash(salt, pass){

    return Promise.resolve()
    .then(() => bcrypt.hash(pass, salt) );
  }

  function salt(){

    return Promise.resolve()
    .then(() => bcrypt.genSalt() );
  }

  function verify(pass, hash){

    return Promise.resolve()
    .then(() => bcrypt.compare(pass, hash) );
  }

  return {
    hash,
    salt,
    verify
  };
};
