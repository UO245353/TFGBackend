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
let themeModel = require('../../model/themeModel');

// Server
const server = require('../../server');
const testHelpers = require('../helpers');
let APP = require('express')();
APP.config = require('../testConfig.js');

describe('THEME TEST :', function() {

  ///////////////////
  // Aux Functions //
  ///////////////////

  function rellenaDB(){

    return Promise.all([
      adminModel.collection.insertMany(admins),
      themeModel.collection.insertMany(themes),
    ])
    .catch(() => Promise.all([
      adminModel.collection.deleteMany({}),
      themeModel.collection.deleteMany({})
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

  const path = 'http://localhost:' + APP.config.server.appPort + '/api/theme';

  let admins = [
    {
      _id: mongoose.Types.ObjectId(),
      name: 'admin0',
      email: 'admin0@gmail.com'
    }
  ];

  let themes = [
    {
      _id: mongoose.Types.ObjectId(),
      title: 'theme 1',
      number: 1
    },
    {
      _id: mongoose.Types.ObjectId(),
      title: 'theme 2',
      number: 2,
      sections: [
        {
          title: 'section 1',
          number: 1
        }
      ],
      questions: [
        {
          question: 'question 1',
          number: 1,
          responses: [
            {
              character: 'a',
              valid: true,
              response: 'valid response'
            },
            {
              character: 'b',
              valid: false,
              response: 'invalid response'
            },
          ]
        }
      ]
    },
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
    themeModel = require('../../model/themeModel')(APP);
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

  describe('GET THEME LIST', () => {

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
        it('ok and return theme list', () => {

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

            _.each(resp.obj, theme => {

              should(!!theme._id).eql(true);
              should(!!theme.title).eql(true);
              should(!!theme.number).eql(true);
            });
          }) ) );

          return Promise.all(tryRequests);
        });
        it('ok and return empty list when havent got themes', () => {

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

          return themeModel.deleteMany({}).exec()
          .then(() => Promise.all(tryRequests) );
        });
      });
    });
  });

  describe('GET THEME', () => {

    describe('ERROR', () => {

      describe('401 unauthorized when :', () => {

        let unauthorizedPath = path + '/' + mongoose.Types.ObjectId().toString();

        it('no token', () => {

          const requests = [
            {
              headers: {},
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.get(unauthorizedPath, request) )
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
          .then(() => rp.get(unauthorizedPath, request) )
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

        let notFoundPath = path + '/' + mongoose.Types.ObjectId().toString();

        it('theme not found', () => {

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
          .then(() => rp.get(notFoundPath, request) )
          .then( () => {

            throw 'Admits not found id';
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
        it('bad body', () => {

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

    describe('SUCCESS', () => {

      describe('200 success when :', () => {
        it('ok and return theme', () => {

          let getThemePath = path + '/' + themes[1]._id.toString();

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
          .then(() => rp.get(getThemePath, request) )
          .catch(err => {

            throw err;
          })
          .then(resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.GET.json.status);

            should(!!resp.obj).eql(true);

            should(!!resp.obj._id).eql(true);
            should(!!resp.obj.title).eql(true);
            should(!!resp.obj.number).eql(true);
            should(!!resp.obj.questions).eql(true);
            should(resp.obj.questions instanceof Array).eql(true);
            should(!!resp.obj.sections).eql(true);
            should(resp.obj.sections instanceof Array).eql(true);
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });

  describe('POST THEME', () => {

    describe('ERROR', () => {

      describe('400 bad request when :', () => {

          it('bad body', () => {

            const requests = [
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  number: themes[0].number,
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  title: 'valid',
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {}
              },
            ];

            let tryRequests = [];

            requests.forEach(request => tryRequests.push( Promise.resolve()
            .then(() => rp.post(path, request) )
            .then( () => {

              throw 'Admits bad request theme';
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

      describe('409 conflict when :', () => {

        it('try to repeat theme', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: themes[0].number,
                title: themes[0].title,
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: themes[0].number,
                title: 'valid',
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: 10,
                title: themes[0].title,
              }
            },
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(path, request) )
          .then( () => {

            throw 'Admits conflict theme';
          })
          .catch( err => {

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

      describe('422 unprocessable entity when :',() => {
        it('bad body', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: 'not a number',
                title: 'valid'
              }
            }
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
                number: 1000,
                title: 'title ' + 1000
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(path, request) )
          .catch(err => {

            throw err;
          })
          .then(resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.NEW.json.status);

            return themeModel.getOne({number: request.json.number}, {number: 1, title: 1})
            .then(theme => {

              should(!!theme.number).eql(true);
              should(theme.number === request.json.number).eql(true);

              should(!!theme.title).eql(true);
              should(theme.title === request.json.title).eql(true);
            });
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });

  describe('DEL THEME', () => {

    let delPath = path + '/' + themes[1]._id.toString();

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
          .then(() => rp.del(delPath, request) )
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
          .then(() => rp.del(delPath, request) )
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

        let notFoundPath = path + '/' + mongoose.Types.ObjectId().toString();

        it('not found theme', () => {

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
          .then(() => rp.del(notFoundPath, request) )
          .then( () => {

            throw 'Admits conflict theme';
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

        let unpEntityPath = path + '/badId';

        it('bad theme id', () => {

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
          .then(() => rp.del(unpEntityPath, request) )
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
              json: {}
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(delPath, request) )
          .catch(err => {

            throw err;
          })
          .then(resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.DEL.json.status);

            return themeModel.getOne({_id: themes[1]._id.toString()}, {_id: 1})
            .then(() => {

              throw 'found removed theme';
            })
            .catch(err => {

              should(!!err).eql(true);
              should(err).eql(themeModel.ERROR.NOT_FOUND);

              return;
            });
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });

  describe('POST NEW THEME QUESTION', () => {

    let newQuestionPath = path + '/' + themes[1]._id.toString() + '/question';

    describe('ERROR', () => {

      describe('400 bad request when :', () => {

          it('bad body', () => {

            const requests = [
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  number: 1,
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  question: 'valid',
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  responses: [
                    {
                      character: 'a',
                      valid: false,
                      response: 'response'
                    }
                  ],
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  number: 1,
                  question: 'valid',
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  number: 1,
                  responses: [
                    {
                      character: 'a',
                      valid: false,
                      response: 'response'
                    }
                  ],
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  question: 'valid',
                  responses: [
                    {
                      character: 'a',
                      valid: false,
                      response: 'response'
                    }
                  ],
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {}
              },
            ];

            let tryRequests = [];

            requests.forEach(request => tryRequests.push( Promise.resolve()
            .then(() => rp.post(newQuestionPath, request) )
            .then( () => {

              throw 'Admits bad request theme';
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
          .then(() => rp.post(newQuestionPath, request) )
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
          .then(() => rp.post(newQuestionPath, request) )
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

      describe('409 conflict when :', () => {

        it('try to repeat theme question', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'question 1',
                number: 1,
                responses: [
                  {
                    character: 'a',
                    valid: true,
                    response: 'valid response'
                  },
                  {
                    character: 'b',
                    valid: false,
                    response: 'invalid response'
                  },
                ]
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(newQuestionPath, request) )
          .then( () => {

            throw 'Admits conflict question theme';
          })
          .catch( err => {

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

      describe('422 unprocessable entity when :',() => {
        it('bad body', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 5,
                number: 1,
                responses: [
                  {
                    character: 'a',
                    valid: true,
                    response: 'valid response'
                  },
                  {
                    character: 'b',
                    valid: false,
                    response: 'invalid response'
                  },
                ]
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1 invalid',
                responses: [
                  {
                    character: 'a',
                    valid: true,
                    response: 'valid response'
                  },
                  {
                    character: 'b',
                    valid: false,
                    response: 'invalid response'
                  },
                ]
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1',
                responses: [
                  {
                    valid: true,
                    response: 'valid response'
                  }
                ]
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1',
                responses: [
                  {
                    character: 'a',
                    response: 'valid response'
                  }
                ]
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1',
                responses: [
                  {
                    character: 'a',
                    valid: true,
                  }
                ]
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1',
                responses: []
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1',
                responses: 'response'
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1',
                responses: [
                  {
                    character: 'ab',
                    valid: true,
                    response: 'valid response'
                  }
                ]
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1',
                responses: [
                  {
                    character: 1,
                    valid: true,
                    response: 'valid response'
                  }
                ]
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1',
                responses: [
                  {
                    character: 'a',
                    valid: 'invalid',
                    response: 'valid response'
                  }
                ]
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1',
                responses: [
                  {
                    character: 'a',
                    valid: true,
                    response: {}
                  }
                ]
              }
            },
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(newQuestionPath, request) )
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
                number: 10,
                question: 'valid',
                responses: [
                  {
                    character: 'a',
                    valid: false,
                    response: 'response'
                  }
                ],
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(newQuestionPath, request) )
          .catch(err => {

            throw err;
          })
          .then(resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.NEW.json.status);

            return themeModel.getOne({_id: themes[1]._id}, {questions: 1})
            .then(theme => {

              let newQuestion = _.find(theme.questions, question => (question.number === request.json.number && question.question === request.json.question) );

              should(!!newQuestion).eql(true);

              return;
            });
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });

  describe('DEL THEME QUESTION', () => {

    let rmQuestionPath = path + '/' + themes[1]._id.toString() + '/question';

    describe('ERROR', () => {

      describe('400 bad request when :', () => {

          it('bad body', () => {

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
                  number: 1
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  question: 'valid'
                }
              }
            ];

            let tryRequests = [];

            requests.forEach(request => tryRequests.push( Promise.resolve()
            .then(() => rp.del(rmQuestionPath, request) )
            .then( () => {

              throw 'Admits bad request theme';
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
          .then(() => rp.del(rmQuestionPath, request) )
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
          .then(() => rp.del(rmQuestionPath, request) )
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

        it('try to repeat theme question', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'not found question',
                number: 0
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(rmQuestionPath, request) )
          .then( () => {

            throw 'Admits not found question theme';
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
        it('bad body', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 5,
                number: 1,
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                question: 'valid',
                number: '1 invalid',
              }
            },
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(rmQuestionPath, request) )
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
                question: themes[1].questions[0].question,
                number: themes[1].questions[0].number
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(rmQuestionPath, request) )
          .catch(err => {

            throw err;
          })
          .then(resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.NEW.json.status);

            return themeModel.getOne({_id: themes[1]._id}, {questions: 1})
            .then(theme => {

              let newQuestion = _.find(theme.questions, question => (question.number === request.json.number && question.question === request.json.question) );

              should(!newQuestion).eql(true);

              return;
            });
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });

  describe('POST NEW THEME SECTION', () => {

    let newSectionPath = path + '/' + themes[1]._id.toString() + '/section';

    describe('ERROR', () => {

      describe('400 bad request when :', () => {

          it('bad body', () => {

            const requests = [
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  number: 1,
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  title: 'valid',
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  content: 'content',
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  number: 1,
                  title: 'valid',
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  number: 1,
                  content: 'content',
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  title: 'valid',
                  content: 'content',
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {}
              },
            ];

            let tryRequests = [];

            requests.forEach(request => tryRequests.push( Promise.resolve()
            .then(() => rp.post(newSectionPath, request) )
            .then( () => {

              throw 'Admits bad request theme';
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
          .then(() => rp.post(newSectionPath, request) )
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
          .then(() => rp.post(newSectionPath, request) )
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

      describe('409 conflict when :', () => {

        it('try to repeat theme section', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                title: themes[1].sections[0].title,
                number: themes[1].sections[0].number,
                content: 'content'
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(newSectionPath, request) )
          .then( () => {

            throw 'Admits conflict question theme';
          })
          .catch( err => {

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

      describe('422 unprocessable entity when :',() => {
        it('bad body', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: 1,
                title: false,
                content: 'content',
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: 'invalid',
                title: 'valid',
                content: 'content',
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: 2,
                title: 'valid',
                content: 2,
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: 'das',
                title: false,
                content: 'valid',
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: 'asd',
                title: false,
                content: 'valid',
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: 1,
                title: false,
                content: false,
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                number: 'invalid',
                title: false,
                content: 2,
              }
            },
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(newSectionPath, request) )
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
                number: 10,
                title: 'valid',
                content: 'valid',
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.post(newSectionPath, request) )
          .catch(err => {

            throw err;
          })
          .then(resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.NEW.json.status);

            return themeModel.getOne({_id: themes[1]._id}, {sections: 1})
            .then(theme => {

              let newSection = _.find(theme.sections, section => (section.number === request.json.number && section.title === request.json.title) );

              should(!!newSection).eql(true);

              return;
            });
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });

  describe('DEL THEME SECTION', () => {

    let rmSectionPath = path + '/' + themes[1]._id.toString() + '/section';

    describe('ERROR', () => {

      describe('400 bad request when :', () => {

          it('bad body', () => {

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
                  number: 1
                }
              },
              {
                headers: {
                  auth: tokens[0]
                },
                json: {
                  title: 'valid'
                }
              }
            ];

            let tryRequests = [];

            requests.forEach(request => tryRequests.push( Promise.resolve()
            .then(() => rp.del(rmSectionPath, request) )
            .then( () => {

              throw 'Admits bad request theme';
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
          .then(() => rp.del(rmSectionPath, request) )
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
          .then(() => rp.del(rmSectionPath, request) )
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

        it('try to repeat theme question', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                title: 'not found question',
                number: 0
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(rmSectionPath, request) )
          .then( () => {

            throw 'Admits not found question theme';
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
        it('bad body', () => {

          const requests = [
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                title: 5,
                number: 1,
              }
            },
            {
              headers: {
                auth: tokens[0]
              },
              json: {
                title: 'valid',
                number: '1 invalid',
              }
            },
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(rmSectionPath, request) )
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
                title: themes[1].sections[0].title,
                number: themes[1].sections[0].number
              }
            }
          ];

          let tryRequests = [];

          requests.forEach(request => tryRequests.push( Promise.resolve()
          .then(() => rp.del(rmSectionPath, request) )
          .catch(err => {

            throw err;
          })
          .then(resp => {
            should(!!resp).eql(true);

            should(!!resp.status).eql(true);
            should(resp.status).eql(successLib.SUCCESS.NEW.json.status);

            return themeModel.getOne({_id: themes[1]._id}, {questions: 1})
            .then(theme => {

              let newQuestion = _.find(theme.questions, question => (question.number === request.json.number && question.question === request.json.question) );

              should(!newQuestion).eql(true);

              return;
            });
          }) ) );

          return Promise.all(tryRequests);
        });
      });
    });
  });
});
