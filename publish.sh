#!/bin/bash

rm -rf ./www/
rm -rf ./dist/
npm run prod-electron
cd ./www/
npm init -y
cd ..
./node_modules/.bin/electron-builder