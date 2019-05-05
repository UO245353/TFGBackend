'use strict';

module.exports = app => {

  const adminModel = require('../model/adminModel')(app);
  const Promise = app.promise;
  const _ = app._;

  const cryptoLib = require('../lib/cryptoLib')(app);
  const tokenLib = require('../lib/tokenLib')(app);

  const errorLib = app.errorLib;
  const successLib = app.successLib;

  function loginAdmin(body){

    return Promise.resolve()
    .then(() => adminModel.getOne({name: body.name}, {_id: 1, pass: 1}) )
    .then( admin => {

      body._id = admin._id;

      return cryptoLib.verify(body.pass, admin.pass);
    })
    .then( match => {

      if(!match){

        throw adminModel.ERROR.NOT_FOUND;
      }

      let modelResp = successLib.SUCCESS.NEW;

      modelResp.json.obj.token = tokenLib.token({
        _id: body._id,
        name: body.name
      });

      return modelResp;
    })
    .catch( err => {

      if(adminModel.isAdminError(err)){

        switch (err) {
          case adminModel.ERROR.NOT_FOUND: {

            throw errorLib.ERROR.NOT_FOUND(['loginAdmin']);
          }
        }
      }
      else{

        throw errorLib.ERROR.INTERNAL_SERVER_ERROR(['loginAdmin']);
      }
    });

  }

  return {
    loginAdmin
  };
};
