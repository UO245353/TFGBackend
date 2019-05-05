#!/bin/bash

if [ -n "$1" ];
then
  if [ "$1" = "--help" ];
  then
    echo -e "Resumen\n"
    echo -e "Comando para ejecutar el backend\n"
    echo -e "Uso\t\t\tDescripcion\n"
    echo -e "run --cln \t\tSe borraran los datos de coverage"
    echo -e "run --npm-update \tSe actualizaran las librerias npm de acuerdo al packaje.json"
    echo -e "run --help \t\tMuestra esta ayuda\n"
    echo -e "run -d \t\t\tSe lanzara el servidor en modo develop"
    echo -e "run -t \t\t\tSe lanzaran todos los tests del servidor"
    echo -e "run -t \"Ruta\" \t\tSe lanzaran los tests del servidor situados en la ruta\n"
    exit 0

  elif [ "$1" = "--cln" ];
  then
    echo -e "Cleaning ..."
    rm -r coverage
    echo -e "Cleaned"
    exit 0

  elif [ "$1" = "--npm-update" ];
  then
    echo -e "Removing old lock..."
    rm package-lock.json
    echo -e "Removed"
    echo -e "Intalling and updating..."
    npm install
    npm ci
    echo -e "Updated"
    exit 0

  elif [ "$1" = "-d" ];
  then

    echo -e "Executing in develop mode..."

    npm run-script start

    echo -e "Closed"
    exit 0

  elif [ "$1" = "-t" ];
  then

    echo -e "Executing in test mode..."

    if [ -z $2 ];
    then
      npm run-script test
    else
      npm run-script individual-test $2
    fi

    echo -e "Closed"

    exit 0

  else
    echo -e "Opcion no valida"
    exit 1
  fi
fi

./run.sh --help
