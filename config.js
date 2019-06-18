'use strict';

//////////////////
// CONFIG VARS //
//////////////////

let fs = require('fs');
let config;
let fileContent;
let configData;
let mongodbURL;
let appPort;
let dbUrl;

///////////////////
// AUX FUNCTIONS //
///////////////////

function getMongoDbUrl(data) {

  return 'mongodb://' + data.mongoConfig.name + ':' + data.mongoConfig.port + '/{db_name}';
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

if(!configData.superuser || !configData.superuser.username || !configData.superuser.pass){
  console.log('Missing or Invalid superuser data');
  configData.superuser = {
    username : '',
    pass : ''
  };
}

appPort = configData.appConfig.appPort || 23456;
dbUrl = mongodbURL.replace(/{db_name}/g, 'GTIData');

config = {
  server: {
    appPort: appPort,
    dbUrl: dbUrl,
  },
  superUserData: configData.superuser,
  secret: configData.secret,
  issuer: configData.issuer,
  amazomAppID: configData.amazomAppID
};

module.exports = config;
