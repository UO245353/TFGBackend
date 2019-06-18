'use strict';

const fs = require('fs');
const Buffer = require('buffer').Buffer;

const opts = {
  'promise': require('bluebird'),
  '_': require('lodash')
};

const [ , , ...args ] = process.argv;

const cryptoLib = require('../lib/cryptoLib')(opts);

return cryptoLib.salt()
.then(salt => cryptoLib.hash(salt, args[1] || 'defaultPass') )
.then(hash => {

  let bf = new Buffer.from(JSON.stringify({
    mongoConfig: {
      name: 'localhost',
      port: 27017
    },
    appConfig: {
      appPort: 23456,
    },
    superuser: {
      username: args[0] || 'defaultName',
      pass: hash
    },
    secret: args[2] || 'TFG',
    issuer: args[3] || 'UniOvi',
    amazomAppID: args[3] || 'amzn1.ask.skill.e51919de-d88f-49cc-b72e-9580e7fb80b7'
  }, null, 2));

  return fs.writeFile('../config.json', bf , function (err) {
    // Si hay error se muestra
    if (!!err) {

      return console.log(err);
    }

    console.log('Config.json creado');
  });
});
