#!/bin/bash

rm -rf ./www/
rm -rf ./dist/
npm run prod-electron
cp ./package.json ./www/

if [[ "$OSTYPE" == "darwin"* ]]
then
    sed -i '' '6,$d' ./www/package.json
else
    sed -i '6,$d' ./www/package.json
fi

echo '  "main": "index.js"' >> ./www/package.json
echo '}' >> ./www/package.json
./node_modules/.bin/electron-builder
