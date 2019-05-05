'use strict';
/*
ERROR REFERENCES https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
*/

module.exports.SUCCESS = {
  NEW: {
    code: 201,
    json: {
      status: 'SUCCESS',
      desc: 'Resource Created',
      obj : {}
    }
  },
  UPDATE: {
    code: 201,
    json: {
      status: 'SUCCESS',
      desc: 'Resource Updated',
      obj : {}
    }
  },
  DEL: {
    code: 200,
    json: {
      status: 'SUCCESS',
      desc: 'Resource Deleted',
      obj : {}
    }
  },
  GET: {
    code: 200,
    json: {
      status: 'SUCCESS',
      desc: 'Resource Getted',
      obj : {}
    }
  },
};
