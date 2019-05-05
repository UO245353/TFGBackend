'use strict';

const fs = require('fs');
const Buffer = require('buffer').Buffer;

let bf;


bf = new Buffer.from(JSON.stringify({
  mongodb: {
    name: 'localhost',
    port: 27017
  },
  adminProfile: {
    appUrl: 'localhost',
    appPort: 12345,
  },
  superuser: {
    username: 'falsoDelTodo',
    pass: 'falsaDelTodo'
  },
  secret: 'TFG'
}, null, 2));

fs.writeFile('../config.json', bf , function (err) {
  // Si hay error se muestra
  if (!!err) {

    return console.log(err);
  }

  console.log('Config.json creado');
});
