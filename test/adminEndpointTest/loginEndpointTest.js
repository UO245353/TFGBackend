/* globals describe, it, before, after, afterEach, beforeEach */
'use strict';

//////////////
// Requires //
//////////////

// Utils
const rp = require('request-promise');
const should = require('should');
let Promise;
let _;
let cryptoLib;
let tokenLib;
let errorLib;
let successLib;
let mongoose = require('mongoose');

// Models
let adminModel = require('../../model/adminModel');

// Server
const server = require('../../server');
const testHelpers = require('../helpers');
let APP = require('express')();
APP.config = require('../testConfig.js');

describe('ADMIN TEST :', function() {

  ///////////////////
  // Aux Functions //
  ///////////////////

  function rellenaDB(){

    return Promise.all([
      adminModel.collection.insertMany(admins)
    ])
    .catch(() => Promise.all([
      adminModel.collection.deleteMany({})
    ]));
  }

  function generaHashSalt(){

    return Promise.resolve()
    .then(() => cryptoLib.salt() )
    .then( salt => cryptoLib.hash(salt, validPass) );
  }

  function rellenaSaltPassAdmins(){

    return Promise.resolve()
    .then(() => generaHashSalt() )
    .then( hash => {
      admins = _.each(admins, admin => {
        admin.pass = hash;
        return admin;
      });
    });
  }

  ///////////////
  // Test Vars //
  ///////////////

  const path = 'http://localhost:' + APP.config.server.appPort + '/api/login';

  const validPass = 'validPass123@';

  let admins = [
    {
      _id: mongoose.Types.ObjectId(),
      name: 'admin0',
      email: 'admin0@gmail.com'
    },
    {
      _id: mongoose.Types.ObjectId(),
      name: 'admin1',
      email: 'admin0@gmail.com'
    },
    {
      _id: mongoose.Types.ObjectId(),
      name: 'admin2',
      email: 'admin2@gmail.com'
    }
  ];

  let tokens = [];

  //////////////////////
  // Config test Vars //
  //////////////////////

  const TEST_TIMEOUT = 5000;

  //Timeout para test de 5 segundos
  this.timeout(TEST_TIMEOUT);

  //////////////////////////
  // actions before tests //
  //////////////////////////

  before(() => server.init(APP)
  .then( app => {
    APP = app;

    _ = require('lodash');
    Promise = APP.promise;
    adminModel = require('../../model/adminModel')(APP);
    cryptoLib = require('../../lib/cryptoLib')(APP);
    tokenLib = require('../../lib/tokenLib')(APP);
    errorLib = APP.errorLib;
    successLib = APP.successLib;

    return rellenaSaltPassAdmins();
  })
  .then(() => {

    _.each(admins, admin => tokens.push(tokenLib.token(admin)));

    return;
  }) );

  beforeEach(() => testHelpers.cleanDatabase(APP)
  .then(() => rellenaDB() ) );

  //////////////////////////
  // actions after tests //
  //////////////////////////

  after(() => testHelpers.stopServers(APP).then(() => testHelpers.cleanDatabase(APP)).then(() => testHelpers.disconnectDb(APP) ));

  ///////////
  // TESTS //
  ///////////

  describe('LOGIN ADMIN', () => {

    let loginPath = path + '/admin';

    describe('ERROR', () => {

      describe('400 bad request when :', () => {
        it('body is empty or incomplete',() => {

          const requests = [
            {
              json: {}
            },
            {
              json: {
                name: 'dani',
              }
            },
            {
              json: {
                pass: 'Testpass123@'
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(loginPath, request) )
          .then( () => {

            throw 'Imposible Login';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(400);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.BAD_REQUEST().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
      });

      describe('404 not found when :', () => {
        it('body name isnt in db', () => {

          const requests = [
            {
              json: {
                name: 'badName',
                pass: validPass
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(loginPath, request) )
          .then(resp => {

            throw 'Must be return 404';
          })
          .catch(err => {

            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(404);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.NOT_FOUND().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
        it('body pass dont match with db pass', () => {

          const requests = [
            {
              json: {
                name: admins[0].name,
                pass: 'badPass123@'
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(loginPath, request) )
          .then(resp => {

            throw 'Must be return 404';
          })
          .catch(err => {

            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(404);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.NOT_FOUND().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
      });

      describe('422 unprocessable entity when :', () => {
        it('bad body', () => {

          const requests = [
            {
              json: {
                name: 'a',
                pass: 'badPass'
              }
            },
            {
              json: {
                name: 'validName',
                pass: 'badPass'
              }
            },
            {
              json: {
                name: 'd',
                pass: 'validPass123@'
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(loginPath, request) )
          .then( () => {

            throw 'Admits invalid request';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(422);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNPROCESSABLE_ENTITY().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });

    describe('SUCCESS', () => {

      describe('201 success when :', () => {
        it('ok', () => {

          const requests = [
            {
              json: {
                name: admins[0].name,
                pass: validPass
              }
            },
            {
              json: {
                name: admins[1].name,
                pass: validPass
              }
            },
            {
              json: {
                name: admins[2].name,
                pass: validPass
              }
            },
          ];

          let tryRequests = [];

          requests.forEach((request, index) => tryRequests.push( Promise.resolve()
          .then(() => rp.post(loginPath, request) )
          .catch( err => {

            throw err;
          })
          .then( resp => {

            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.NEW.json.status);

            should(!!resp.obj).eql(true);

            should(!!resp.obj.token).eql(true);

            return tokenLib.verifyAndDecode(resp.obj.token)
            .then( decoded => {

              should(!!decoded.name).eql(true);
              should(decoded.name).eql(admins[index].name);

              should(!!decoded._id).eql(true);
              should(decoded._id).eql(admins[index]._id.toString());
            });
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });
});
