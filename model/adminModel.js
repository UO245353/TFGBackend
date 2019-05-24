'use strict';

module.exports = app => {

  const connection = app.dbLib.createConnection();

  const adminSchema = require('./model-schemas/adminSchema')(app);

  const admin = connection.model('admin', adminSchema);

  const Promise = app.promise;

  const _ = app._;

  const ERROR = {
    UNKNOWN: '00',
    NOT_FOUND: '01',
    CONFLICT: '02'
  };

  admin.ERROR = ERROR;

  admin.isAdminError = error => {

    return _.find(Object.values(ERROR), code => {
      if(code === error){

        return code;
      }
    }) || false;
  };

  admin.get = (filter, projections) => {

    return Promise.resolve()
    .then(() => admin.find(filter, projections).exec() )
    .then( adminList => {

      if(!adminList){

        throw ERROR.UNKNOWN;
      }

      return adminList;
    });
  };

  admin.getOne = (filter, projections) => {

    return Promise.resolve()
    .then(() => admin.findOne(filter, projections).exec() )
    .then( admin => {

      if(!admin){

        throw ERROR.NOT_FOUND;
      }

      return admin;
    });
  };

  admin.edit = (filter, editedData) =>{

    return Promise.resolve()
    .then(() => {

      if(!!editedData.name){

        return Promise.resolve()
        .then(() => admin.getOne({name: editedData.name}, {_id: 1}) )
        .then( admin => {
          if(admin._id.toString() === filter._id.toString()){

            throw ERROR.NOT_FOUND;
          }

          return ERROR.CONFLICT;
        });
      }

      throw ERROR.NOT_FOUND;
    })
    .catch( err => (err === ERROR.NOT_FOUND) ? admin.updateOne(filter, {$set: editedData}).exec() : ERROR.UNKNOWN )
    .then( count => {

      if(count === ERROR.UNKNOWN || count === ERROR.CONFLICT){

        throw count;
      }

      if(count.n === 0){

        throw ERROR.NOT_FOUND;
      }

      return;
    });
  };

  admin.add = newData => {

    return Promise.resolve()
    .then(() => admin.getOne({name: newData.name},{_id: 1}) )
    .then(() => ERROR.CONFLICT)
    .catch( err => (err !== ERROR.NOT_FOUND) ? err : admin.create(newData) )
    .then( result => {

      if(result === ERROR.CONFLICT){

        throw result;
      }

      return;
    });
  };

  admin.rm = filter => {

    return Promise.resolve()
    .then(() => admin.deleteOne(filter).exec() )
    .then( count => {

      if(count.n === 0){

        throw ERROR.NOT_FOUND;
      }

      return;
    });
  };

  admin.exist = filter => {

    return Promise.resolve()
    .then(() => admin.getOne(filter, {_id: 1}))
    .then(() => true)
    .catch(() => false);
  };

  return admin;
};
