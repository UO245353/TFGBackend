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
    .then( salt => cryptoLib.hash(salt, 'passTest') );
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

  const path = 'http://localhost:' + APP.config.server.appPort + '/api/admin';

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

  describe('GET ADMIN LIST', () => {

    describe('ERROR', () => {

      describe('401 unauthorized when :', () => {
        it('no token', () => {

          const requests = [
            {
              headers: {},
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.get(path, request) )
          .then( () => {

            throw 'Admits invalid token';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(401);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNAUTHORIZED().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
        it('bad token', () => {

          const requests = [
            {
              headers: {
                auth: 'falseToken'
              },
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.get(path, request) )
          .then( () => {

            throw 'Admits invalid token';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(401);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNAUTHORIZED().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });

    describe('SUCCESS', () => {

      describe('200 success when :', () => {
        it('ok and return admin list', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.get(path, request) )
          .catch(err => {

            throw err;
          })
          .then(resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.GET.json.status);

            should(resp.obj instanceof Array).eql(true);

            _.each(resp.obj, admin => {

              should(!!admin._id).eql(true);
              should(!!admin.name).eql(true);
            });
          }) ) );

          return Promise.all(tryRequests);
        });
        it('ok and return empty list when havent got admins', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.get(path, request) )
          .catch(err => {

            throw err;
          })
          .then(resp => {

            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.GET.json.status);

            should(resp.obj instanceof Array).eql(true);

            should(resp.obj.length).eql(0);

          }) ) );

          return adminModel.deleteMany({}).exec()
          .then(() => Promise.all(tryRequests) );
        });
      });
    });
  });

  describe('GET ADMIN', () => {

    const getAdminPath = path + '/' + admins[0]._id;

    describe('ERROR',() => {

      describe('401 unauthorized when :',() => {
        it('no token', () => {

          const requests = [
            {
              headers: {},
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.get(getAdminPath, request) )
          .then( () => {

            throw 'Admits invalid token';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(401);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNAUTHORIZED().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
        it('bad token', () => {

          const requests = [
            {
              headers: {
                auth: 'falseToken'
              },
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.get(getAdminPath, request) )
          .then( () => {

            throw 'Admits invalid token';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(401);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNAUTHORIZED().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
      });

      describe('404 not found when :',() => {
        it('admin not found',() => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            }
          ];

          const notFoundPath = path + '/' + mongoose.Types.ObjectId();

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.get(notFoundPath, request) )
          .then( () => {

            throw 'Return inexistant admin';
          })
          .catch( err => {
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

      describe('422 unprocessable entity when :',() => {
        it('bad admin id', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            }
          ];

          const badResquestPath = path + '/badID' ;

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.get(badResquestPath, request) )
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

    describe('SUCCESS',() => {

      describe('200 success when :',() => {
        it('ok and admin', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.get(getAdminPath, request) )
          .catch( err => {

            throw err;
          })
          .then( resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.GET.json.status);

            should(!!resp.obj).eql(true);

          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });

  describe('POST NEW ADMIN', () => {

    describe('ERROR', () => {

      describe('400 bad request', () => {
        it('body is empty or incomplete',() => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                email: 'd@d.d',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: 'd@d.d',
              }
            },
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(path, request) )
          .then( () => {

            throw 'Return inexistant admin';
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

      describe('401 unauthorized', () => {
        it('no token', () => {

          const requests = [
            {
              headers: {},
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(path, request) )
          .then( () => {

            throw 'Admits invalid token';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(401);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNAUTHORIZED().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
        it('bad token', () => {

          const requests = [
            {
              headers: {
                auth: 'falseToken'
              },
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(path, request) )
          .then( () => {

            throw 'Admits invalid token';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(401);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNAUTHORIZED().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
      });

      describe('409 conflict', () => {
        it('admin body name is already in db', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'admin2',
                email: 'admin2@gmail.com',
                pass: 'Testpass@123'
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(path, request) )
          .then(resp => {

            throw 'Must be return 409';
          })
          .catch(err => {

            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(409);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.CONFLICT().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
      });

      describe('422 unprocessable entity', () => {
        it('should return 422 unprocessable entity with bad body', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'a',
                email: 'badEmail',
                pass: 'badPass'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: 'badEmail',
                pass: 'badPass'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: 'd@d.d',
                pass: 'badPass'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'd',
                email: 'badEmail',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'd',
                email: 'd@d.d',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'da',
                email: 'd@d.d',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: '@d.d',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: '@.',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: 'd@d.d',
                pass: 'testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: 'd@d.d',
                pass: 'Testpass@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: 'd@d.d',
                pass: 'Testpass123'
              }
            },
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(path, request) )
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
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'admin3',
                email: 'admin3@gmail.com',
                pass: 'Testpass@123'
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(path, request) )
          .catch( err => {

            throw err;
          })
          .then( resp => {

            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.NEW.json.status);

            return adminModel.findOne({name: request.json.name}).exec()
            .then(admin => {

              should(!!admin).eql(true);

              should(!!admin.name).eql(true);
              should(admin.name).eql(request.json.name);

              should(!!admin.email).eql(true);
              should(admin.email).eql(request.json.email);

              should(!!admin.pass).eql(true);

              return Promise.resolve()
              .then(() => cryptoLib.verify(request.json.pass, admin.pass) )
              .then( resp => should(resp).eql(true));
            });
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });

  describe('POST EDIT ADMIN', () => {

    const editAdminPath = path + '/' + admins[0]._id;

    describe('ERROR', () => {

      describe('400 bad request when :', () => {
        it('body is empty',() => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(editAdminPath, request) )
          .then( () => {

            throw 'Return inexistant admin';
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

      describe('401 unauthorized when :', () => {
        it('no token', () => {

          const requests = [
            {
              headers: {},
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(editAdminPath, request) )
          .then( () => {

            throw 'Admits invalid token';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(401);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNAUTHORIZED().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
        it('bad token', () => {

          const requests = [
            {
              headers: {
                auth: 'falseToken'
              },
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(editAdminPath, request) )
          .then( () => {

            throw 'Admits invalid token';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(401);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNAUTHORIZED().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
      });

      describe('404 not found when :', () => {
        it('admin not found',() => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'sample',
                email: 'sample@sample.sample',
                pass: 'Sample123@'
              }
            }
          ];

          const notFoundPath = path + '/' + mongoose.Types.ObjectId();

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then( () => rp.post(notFoundPath, request) )
          .then( () => {

            throw 'Admits inexistant admin';
          })
          .catch( err => {
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

      describe('409 conflict when :', () => {
        it('admin body name is already in db', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: admins[1].name,
                email: 'sample@sample.sample',
                pass: 'Sample123@'
              }
            },

          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(editAdminPath, request) )
          .then(resp => {

            throw 'Must be return 409';
          })
          .catch(err => {

            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(409);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.CONFLICT().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
      });

      describe('422 unprocessable entity when :', () => {
        it('bad admin id', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            }
          ];

          const badResquestPath = path + '/badID' ;

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(badResquestPath, request) )
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
        it('bad body', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                email: 'd@d.d',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'a',
                email: 'badEmail',
                pass: 'badPass'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: 'badEmail',
                pass: 'badPass'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: 'd@d.d',
                pass: 'badPass'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'd',
                email: 'badEmail',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'd',
                email: 'd@d.d',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'da',
                email: 'd@d.d',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: '@d.d',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: '@.',
                pass: 'Testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: 'd@d.d',
                pass: 'testpass123@'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'das',
                email: 'd@d.d',
                pass: 'Testpass@'
              }
            },
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(editAdminPath, request) )
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
              headers: {
                auth: tokens[0]
              },
              json: {
                name: 'admin3',
                email: 'admin3@gmail.com',
                pass: 'Testpass@123'
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(editAdminPath, request) )
          .catch( err => {

            throw err;
          })
          .then( resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.NEW.json.status);

            return adminModel.findOne({name: request.json.name}).exec()
            .then(admin => {

              should(!!admin).eql(true);

              should(!!admin.name).eql(true);
              should(admin.name).eql(request.json.name);

              should(!!admin.email).eql(true);
              should(admin.email).eql(request.json.email);

              should(!!admin.pass).eql(true);

              return Promise.resolve()
              .then(() => cryptoLib.verify(request.json.pass, admin.pass) )
              .then( resp => should(resp).eql(true));
            });
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });

  describe('REMOVE ADMIN', () => {

    const removeAdminPath = path + '/' + admins[0]._id;

    describe('ERROR',() => {

      describe('401 unauthorized when :',() => {
        it('no token', () => {

          const requests = [
            {
              headers: {},
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(removeAdminPath, request) )
          .then( () => {

            throw 'Admits invalid token';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(401);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNAUTHORIZED().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
        it('bad token', () => {

          const requests = [
            {
              headers: {
                auth: 'falseToken'
              },
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(removeAdminPath, request) )
          .then( () => {

            throw 'Admits invalid token';
          })
          .catch( err => {
            should(!!err).eql(true);

            should(!!err.statusCode).eql(true);
            should(err.statusCode).eql(401);

            should(!!err.error).eql(true);

            should(!!err.error.status).eql(true);
            should(err.error.status).eql(errorLib.ERROR.UNAUTHORIZED().json.status);
          }) ) );

          return Promise.all(tryRequests);
        });
      });

      describe('404 not found when :',() => {
        it('admin not found',() => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            }
          ];

          const notFoundPath = path + '/' + mongoose.Types.ObjectId();

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(notFoundPath, request) )
          .then( () => {

            throw 'Return inexistant admin';
          })
          .catch( err => {
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

      describe('422 unprocessable entity when :',() => {
        it('bad admin id', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            }
          ];

          const badResquestPath = path + '/badID' ;

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(badResquestPath, request) )
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

    describe('SUCCESS',() => {

      describe('200 success when :',() => {
        it('ok and admin', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(removeAdminPath, request) )
          .catch( err => {

            throw err;
          })
          .then( resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.DEL.json.status);

            should(!!resp.obj).eql(true);

          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });
});
