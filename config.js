'use strict';

//////////////////
// CONFIG VARS //
//////////////////

let fs = require('fs');
let config;
let fileContent;
let configData;
let mongodbURL;
let adminAppPort;
let dbUrl;

///////////////////
// AUX FUNCTIONS //
///////////////////

function getMongoDbUrl(data) {

  return 'mongodb://' + data.mongodb.name + ':' + data.mongodb.port + '/{db_name}';
}


///////////
// CONFIG//
///////////

try{

  fileContent = fs.readFileSync(__dirname + '/config.json');
}
catch(e){
  if(e.code === 'ENOENT'){
    console.log('Missing File config.json');
  }
  else{
    console.log('An error ocurred while read config.json', JSON.stringify(e,0,2));
  }

  process.exit(1);
}

configData = JSON.parse(fileContent);
mongodbURL = getMongoDbUrl(configData);

if(!configData.superuser || !configData.superuser.username || !configData.superuser.pass || !configData.superuser.salt){
  console.log('Missing or Invalid superuser data');
  configData.superuser = {
    username : '',
    pass : '',
    salt : ''
  };
}

switch (process.env.NODE_ENV) {
  case 'production':
  adminAppPort = 23456;
  dbUrl = mongodbURL.replace(/{db_name}/g, 'prodData');
  break;
  default:
  adminAppPort = 23456;
  dbUrl = mongodbURL.replace(/{db_name}/g, 'devData');
  break;
}

config = {
  server: {
    adminAppPort: adminAppPort,
    dbUrl: dbUrl,
  },
  adminProfile: {
    appUrl: configData.adminProfile.appUrl,
    appPort: configData.adminProfile.appPort,
  },
  superUserData: configData.superuser,
  secret: configData.secret
};

module.exports = config;
