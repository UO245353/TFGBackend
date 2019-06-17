'use strict';
/*
ERROR REFERENCES https://www.bennadel.com/blog/2434-http-status-codes-for-invalid-data-400-vs-422.htm
*/

const _ = require('lodash');

const ERROR = {
  BAD_REQUEST: (errorsPlaces) => _.extend(new Error('BAD_REQUEST'), {
    code: 400,
    json: {
      status: 'BAD_REQUEST',
      desc: 'Malformed request',
      in: errorsPlaces
    }
  }),
  UNAUTHORIZED: (errorsPlaces) => _.extend(new Error('UNAUTHORIZED'), {
    code: 401,
    json: {
      status: 'UNAUTHORIZED',
      desc: 'Invalid or inexistant token',
      in: errorsPlaces
    }
  }),
  NOT_FOUND: (errorsPlaces) => _.extend(new Error('NOT_FOUND'), {
    code: 404,
    json: {
      status: 'NOT_FOUND',
      desc: 'Entity not found',
      in: errorsPlaces
    }
  }),
  CONFLICT: (errorsPlaces) => _.extend(new Error('CONFLICT'), {
    code: 409,
    json: {
      status: 'CONFLICT',
      desc: 'Ivalid indetifier',
      in: errorsPlaces
    }
  }),
  UNPROCESSABLE_ENTITY: (errorsPlaces) => _.extend(new Error('UNPROCESSABLE_ENTITY'), {
    code: 422,
    json: {
      status: 'UNPROCESSABLE_ENTITY',
      desc: 'Well formed request whose data values aren\'t valid (cant be processed)',
      in: errorsPlaces
    }
  }),
  INTERNAL_SERVER_ERROR: (errorsPlaces) => _.extend(new Error('INTERNAL_SERVER_ERROR'), {
    code: 500,
    json: {
      status: 'INTERNAL_SERVER_ERROR',
      desc: 'Unknow error',
      in: errorsPlaces
    }
  })
};

function errorHandler(err, req, res, next) {

  console.log('UNEXPECTED ERROR err\n' + Object.keys(err) + '\n' + err);

  console.log('UNEXPECTED ERROR req\n' + Object.keys(req) + '\n' + req);

  console.log('UNEXPECTED ERROR res\n' + Object.keys(res) + '\n' + res);

  console.log('UNEXPECTED ERROR next\n' + Object.keys(next) + '\n' + next);

  return res.status(500).json(err);
}

function isKnownError(err){

  if(!err.code || !err.json){

    return false;
  }

  return (!!Object.keys(ERROR).find(error =>{

    if(ERROR[error]().code === err.code){

      return error;
    }
  })) ? true : false;
}

module.exports = {
  errorHandler,
  isKnownError,
  ERROR
};
