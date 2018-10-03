#!/bin/bash

rm -rf ./www/
rm -rf ./dist/
npm run prod-electron
cp ./package.json ./www/
sed  -i'' '6,999d' ./www/package.json
echo '"main": "index.js"' >> ./www/package.json
echo '}' >> ./www/package.json
./node_modules/.bin/electron-builder