'use strict';

//////////////
// REQUIRES //
//////////////

let cluster = require('cluster');

////////////////////
// SET UP CLUSTER //
////////////////////

cluster.setupMaster({
    exec: 'worker.js'
});

//////////////
// APP VARS //
//////////////

let workers = [];

///////////////////
// AUX FUNCTIONS //
///////////////////

function init() {

    let numCpus = require('os').cpus().length;

    console.log('Numero de workers; ' + numCpus);

    for (let i = 0; i < numCpus; i++) {
        startWorker();
    }
}

function startWorker() {

    let worker;
    let workerNumEnv = {};

    workerNumEnv.WORKER_NUM = workers.length;

    worker = cluster.fork(workerNumEnv);
    worker.send({workerNum: workers.length});

    workers.push(worker);
}


function killWorkers() {

    for (let i = 0; i < workers.length; i += 1) {
        workers[i].kill();
    }

    console.log('Error, exiting...');

    process.exit(1);
}

function restartWorker(worker) {

  let exitCode = worker.process.exitCode;

  console.log('worker ' + worker.process.pid + ' died ('+exitCode+'). restarting...');

  for (let i = 0; i < workers.length; i += 1) {

      if (workers[i].pid === worker.pid) {
          workers.splice(i, 1);
          break;
      }
  }

  startWorker();
}

//////////////////
// INIT CLUSTER //
//////////////////

cluster.on('exit', restartWorker);

init();

process.on('exit', killWorkers);
process.on('uncaughtException', killWorkers);
